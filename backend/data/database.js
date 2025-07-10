import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class JSONDatabase {
  constructor() {
    this.dataPath = path.join(__dirname);
  }

  async readFile(filename) {
    try {
      const filePath = path.join(this.dataPath, filename);
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error Reading ${filename}:`, error);
      throw error;
    }
  }

  async writeFile(filename, data) {
    try {
      const filePath = path.join(this.dataPath, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      throw error;
    }
  }

  //User Operations
  async getAllUsers() {
    return await this.readFile("users.json");
  }

  async getUserById(id) {
    const data = await this.readFile("users.json");
    return data.users.find((user) => user.user_id === parseInt(id));
  }

  async getUserByEmail(email) {
    const data = await this.readFile("users.json");
    return data.users.find((user) => user.email === email);
  }

  async createUser(userData) {
    const data = await this.readFile("users.json");
    const newUser = {
      user_id: data.nextId,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.users.push(newUser);
    data.nextId++;
    await this.writeFile("users.json", data);
    return newUser;
  }

  async updateUser(id, updateData) {
    const data = await this.readFile("users.json");
    const userIndex = data.users.findIndex(
      (user) => user.user_id === parseInt(id)
    );
    if (userIndex === -1) throw new Error("User not Found");

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    await this.writeFile("users.json", data);
    return data.users[userIndex];
  }
}

export default new JSONDatabase();
