// Tạo connect đến MongoDB với MongoDB Driver (native connect cho nextauth)
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function connectAndPing(client: MongoClient) {
  const connectedClient = await client.connect();
  try {
    // Kiểm tra kết nối bằng lệnh ping
      await connectedClient.db().command({ ping: 1 });
      console.log('MongoDB connected successfully (ping pong)');
    } catch (error) {
      console.error('MongoDB ping failed:', error);
    }
  return connectedClient;
}

// development environment: Dùng biến gobal để giữ kết nối MongoDB -> tránh tạo kết nối mới mỗi lần gọi API.
if (process.env.NODE_ENV === 'development') {
    // Add thuộc tính `_mongoClientPromise` vào `global` để giữ kết nối MongoDB.
  let globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = connectAndPing(client);
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // product environment: code chỉ chạy khi build -> tạo kết nối mới (an toàn)
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
