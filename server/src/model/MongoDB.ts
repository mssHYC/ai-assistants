import { MongoClient, Db, Collection, Document, OptionalUnlessRequiredId, CreateCollectionOptions, Filter } from 'mongodb';
import { config } from '../utils/getEnv';

class MongoDB {
  private static instance: MongoDB;
  private client: MongoClient;
  private db: Db | null = null;

  constructor() {
    const username = encodeURIComponent(config.MONGO_USERNAME || '');
    const password = encodeURIComponent(config.MONGO_PASSWORD || '');
    const authSource = config.MONGO_AUTH_SOURCE || 'admin';
    const dbName = config.MONGO_DB_NAME || 'ai-assistants';

    const uri = config.MONGO_URI ||
      `mongodb://${username}:${password}@localhost:27017/${dbName}?authSource=${authSource}`;

    this.client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      authMechanism: 'SCRAM-SHA-256',
    });
  }

  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  public async connect(): Promise<Db> {
    if (!this.db) {
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB');
    }
    return this.db;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  public async getCollection<T extends Document>(name: string): Promise<Collection<T>> {
    const db = await this.connect();
    return db.collection<T>(name);
  }

  // 基本CRUD操作
  public async insertOne<T extends Document>(collectionName: string, doc: OptionalUnlessRequiredId<T>) {
    const collection = await this.getCollection<T>(collectionName);
    return collection.insertOne(doc);
  }

  public async findOne<T extends Document>(collectionName: string, query: Filter<Document>) {
    const collection = await this.getCollection<T>(collectionName);
    return collection.findOne(query);
  }

  public async findMany<T extends Document>(collectionName: string, query: Filter<Document> = {}) {
    const collection = await this.getCollection<T>(collectionName);
    return collection.find(query).toArray();
  }

  public async updateOne<T extends Document>(
    collectionName: string,
    filter: Filter<Document>,
    update: Partial<T>
  ) {
    const collection = await this.getCollection<T>(collectionName);
    return collection.updateOne(filter, { $set: update });
  }

  public async deleteOne(collectionName: string, filter: Filter<Document>) {
    const collection = await this.getCollection(collectionName);
    return collection.deleteOne(filter);
  }

  /**
   * 创建新集合
   * @param name 集合名称
   * @param options 集合选项
   */
  public async createCollection(
    name: string,
    options?: CreateCollectionOptions
  ) {
    const db = await this.connect();
    return db.createCollection(name, options);
  }
}

export default MongoDB.getInstance();
