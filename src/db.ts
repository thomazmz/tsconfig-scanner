import * as mongodb from 'mongodb'
import { SonarMetrics } from './sonar'
import { TypescriptCompilerOptions } from './typescript'

const MONGO_URL = 'mongodb+srv://thomazmz:***@production.vtctzdd.mongodb.net/?retryWrites=true&w=majority'

const MONGO_DATABASE_NAME = 'production'

const client = new mongodb.MongoClient(MONGO_URL)

const db = client.db(MONGO_DATABASE_NAME)

export async function connect() {
  await client.connect();
  await db.collection('scanning_results').createIndex( 'hash', { unique: true } )
}

export async function disconnect() {
  await client.close()
}

export async function saveRepositoryDocument(document: RepositoryDocument): Promise<void> {
  await db.collection('scanning_results').insertOne(document)
}

type RepositoryDocument = {
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly pushedAt: Date
  readonly providerId: string
  readonly provider: string
  readonly hash: string
  readonly name: string
  readonly fullName: string
  readonly apiUrl: string
  readonly gitUrl: string
  readonly isTemplate: boolean
  readonly isPrivate: boolean
  readonly isFork: boolean
  readonly forks: number
  readonly issues: number
  readonly stars: number
  readonly watchers: number
  readonly language: string
  readonly sonarMetrics: SonarMetrics
  readonly typescriptOptions: TypescriptCompilerOptions
}