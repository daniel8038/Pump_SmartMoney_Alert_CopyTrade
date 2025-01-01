import { readFile, writeFile } from "fs/promises";
import path from "path";
import { EventEmitter } from "events";
import { isValidSolanaAddress } from "./utils";

export const addressEvents = new EventEmitter();
class AddressManager {
  private configPath: string;
  constructor() {
    this.configPath = path.join(__dirname, "config/smartMoneyAddress.json");
  }
  async addAddress(
    address: string,
    name: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 验证地址格式
      if (!isValidSolanaAddress(address)) {
        return { success: false, message: "无效的 Solana 地址格式" };
      }
      // 验证名称长度
      if (name.length > 10) {
        return { success: false, message: "名称长度不能超过10个字符" };
      }
      // 检查地址是否已存在
      const addresses = await this.getAddresses();
      if (addresses[address]) {
        return { success: false, message: "该地址已存在" };
      }
      // 添加新地址
      addresses[address] = name;
      await writeFile(this.configPath, JSON.stringify(addresses, null, 2));
      addressEvents.emit("addressesUpdated", Object.keys(addresses));
      return { success: true, message: "地址添加成功" };
    } catch (error) {
      console.error("Error in addAddress:", error);
      return { success: false, message: "添加失败，请稍后重试" };
    }
  }
  async removeAddress(
    address: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 验证地址格式
      if (!isValidSolanaAddress(address)) {
        return { success: false, message: "无效的 Solana 地址格式" };
      }

      // 检查地址是否存在
      const addresses = await this.getAddresses();
      if (!addresses[address]) {
        return { success: false, message: "该地址不存在" };
      }

      // 删除地址
      delete addresses[address];
      await writeFile(this.configPath, JSON.stringify(addresses, null, 2));
      addressEvents.emit("addressesUpdated", Object.keys(addresses));

      return { success: true, message: "地址删除成功" };
    } catch (error) {
      console.error("Error in removeAddress:", error);
      return { success: false, message: "删除失败，请稍后重试" };
    }
  }
  async getAddresses(): Promise<Record<string, string>> {
    const data = await readFile(this.configPath, "utf8");
    return JSON.parse(data);
  }
  // 获取所有地址数组
  async getAddressArray(): Promise<string[]> {
    const addresses = await this.getAddresses();

    return Object.keys(addresses);
  }

  // 获取地址映射
  async getAddressMap(): Promise<Record<string, string>> {
    return await this.getAddresses();
  }
}
export const addressManager = new AddressManager();
