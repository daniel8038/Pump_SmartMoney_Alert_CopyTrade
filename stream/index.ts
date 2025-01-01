import {
  SubscribeRequest,
  SubscribeUpdate,
} from "@triton-one/yellowstone-grpc";
import { ClientDuplexStream } from "@grpc/grpc-js";
import handleData from "../strategy/handleData";

/**
 * 订阅数据
 * @param stream 流
 * @param request filter
 * @returns
 */
const sendSubscribeRequest = async (
  stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>,
  request: SubscribeRequest
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    stream.write(request, (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
/**
 * 监听data
 * @param stream 流
 * @returns
 */
const handleStreamEvent = async (
  stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    stream.on("data", async (data: SubscribeUpdate) => {
      await handleData(data);
    });
    stream.on("error", (error: Error) => {
      console.log("[stream 错误]");
      reject(error);
      stream.end;
    });
    stream.on("end", () => {
      console.log("[stream ends]");
      resolve();
    });
    stream.on("close", () => {
      console.log("[stream关闭]");
      resolve();
    });
  });
};
/**
 * 心跳检测
 */
const handleStreamPingPong = async (
  stream: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>
) => {
  return setInterval(async () => {
    await new Promise<void>((resolve, reject) => {
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
  }, 5000);
};
export { sendSubscribeRequest, handleStreamEvent, handleStreamPingPong };
