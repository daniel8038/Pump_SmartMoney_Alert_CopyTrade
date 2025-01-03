import Client, {
  CommitmentLevel,
  SubscribeRequest,
  SubscribeUpdate,
} from "@triton-one/yellowstone-grpc";
import { ClientDuplexStream } from "@grpc/grpc-js";
import handleData from "../strategy/handleData";
import { GRPC_URL_MAIN, PUMP_FUN_PROGRAM_ID } from "../config";
import { addressEvents, addressManager } from "../addressManager";
class SubscriptionManager {
  private client: Client;
  private currentStream: ClientDuplexStream<
    SubscribeRequest,
    SubscribeUpdate
  > | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isUpdating: boolean = false;
  // init client And AddressEventListener
  constructor() {
    this.client = new Client(GRPC_URL_MAIN, undefined, {
      "grpc.max_receive_message_length": 16 * 1024 * 1024,
    });
    this.setupAddressEventListener();
  }
  //
  async setupStream() {
    if (this.isUpdating) {
      console.log("[Setup already in progress, skipping...]");
      return;
    }
    this.isUpdating = true;
    console.log("执行setupStream");
    try {
      if (!this.currentStream) {
        this.currentStream = await this.client.subscribe();
        await this.setupStreamEventHandlers(this.currentStream);
        await this.startPingPong(this.currentStream);
      }
      await this.updateSubscription();
      this.isUpdating = false;
    } catch (error) {
      console.error("[Stream setup error:]", error);
      this.isUpdating = false;
      throw error;
    }
  }
  private setupAddressEventListener() {
    addressEvents.on("addressesUpdated", async () => {
      try {
        if (this.isUpdating) {
          console.log("[Update in progress, skipping...]");
          return;
        }
        console.log(
          "[Smart money addresses updated, updating subscription...]"
        );
        await this.updateSubscription();
        console.log("[Subscription updated successfully]");
      } catch (error) {
        console.error("[Error updating subscription:]", error);
        this.isUpdating = false;
      }
    });
  }
  private async updateSubscription() {
    if (!this.currentStream || this.currentStream.destroyed) {
      console.log("[Stream not available, creating new stream]");
      this.currentStream = await this.client.subscribe();
      await this.setupStreamEventHandlers(this.currentStream);
      await this.startPingPong(this.currentStream);
    }

    const SMART_ADDRESS_ARRAY = await addressManager.getAddressArray();
    console.log("Smart money addresses:", SMART_ADDRESS_ARRAY);

    const subRequestConfig: SubscribeRequest = {
      accounts: {},
      slots: {},
      transactions: {
        pumpFun: {
          accountInclude: SMART_ADDRESS_ARRAY,
          accountExclude: [],
          accountRequired: [PUMP_FUN_PROGRAM_ID],
          failed: false,
        },
      },
      transactionsStatus: {},
      blocks: {},
      blocksMeta: {},
      entry: {},
      accountsDataSlice: [],
      commitment: CommitmentLevel.CONFIRMED,
    };

    await this.sendSubscribeRequest(this.currentStream, subRequestConfig);
  }

  private async setupStreamEventHandlers(
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
  ): Promise<void> {
    console.log("Setting up stream event handlers");

    return new Promise<void>((resolve) => {
      stream.on("data", async (data: SubscribeUpdate) => {
        try {
          await handleData(data);
        } catch (error) {
          console.error("[Data handling error:]", error);
        }
      });

      stream.on("error", (error: Error) => {
        console.error("[Stream error:]", error);
        this.handleStreamError();
      });

      stream.on("end", () => {
        console.log("[Stream ended]");
        this.handleStreamEnd();
      });

      stream.on("close", () => {
        console.log("[Stream closed]");
        this.handleStreamEnd();
      });

      resolve();
    });
  }
  /**
   * 订阅数据
   * @param stream 流
   * @param request filter
   * @returns
   */
  private sendSubscribeRequest = async (
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>,
    request: SubscribeRequest
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      console.log("发送订阅请求");
      stream.write(request, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
  private async handleStreamError() {
    console.log("[Handling stream error]");
    this.currentStream = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (!this.isUpdating) {
      await this.setupStream().catch(console.error);
    }
  }

  private async handleStreamEnd() {
    console.log("[Handling stream end]");
    this.currentStream = null;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  /**
   * 心跳检测
   */
  private async startPingPong(
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
  ): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    const sendPing = async () => {
      if (!stream || stream.destroyed) {
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        return;
      }

      try {
        await this.sendPing(stream);
      } catch (error) {
        console.error("[Ping error:]", error);
        await this.handleStreamError();
      }
    };

    this.pingInterval = setInterval(sendPing, 5000);
    return sendPing(); // Send first ping immediately
  }

  private sendPing = async (
    stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      stream.write(
        {
          accounts: {},
          slots: {},
          transactions: {},
          transactionsStatus: {},
          blocks: {},
          blocksMeta: {},
          entry: {},
          accountsDataSlice: [],
          commitment: undefined,
          ping: { id: 1 },
        },
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  };
}

export const subscriptionManager = new SubscriptionManager();
