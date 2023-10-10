import { GitRepository } from 'git'
import * as utils from './utils'
import axios from 'axios'

const GITHUB_TOKEN = '***'

const GITHUB_ACCEPT_HEADER = 'application/vnd.github.v3+json'

const GITHUB_PROGRAMMING_LANGUAGE = 'typescript'

const GITHUB_API_URL = 'https://api.github.com'

const GITHUB_API_PATH = 'search/repositories'

const GITHUB_PAGINATION_LIMIT = 'per_page=30'

const GITHUB_PAGINATION_ORDER = 'order=desc'

const GITHUB_PAGINATION_SORT = 'sort=stars'

const GITHUB_MINUMUM_STARED = '5'

export async function getRepositories(date: Date, page: number = 1) {

  const [ startDate, endDate ] = utils.getDailyDateRange(date)

  const start = startDate.toISOString()

  const end = endDate.toISOString()

  const requestQuery = `q=language:${GITHUB_PROGRAMMING_LANGUAGE}+created:${start}..${end}+stars:>${GITHUB_MINUMUM_STARED}+fork:false+is:public`

  const requestUrl = `${GITHUB_API_URL}/${GITHUB_API_PATH}?${requestQuery}&${GITHUB_PAGINATION_ORDER}&${GITHUB_PAGINATION_SORT}&${GITHUB_PAGINATION_LIMIT}&page=${page}`

  const { data, status } = await axios.get(requestUrl, { headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: GITHUB_ACCEPT_HEADER,
  }})

  if(status !== 200) {
    throw new Error('Error fetching Github repositories')
  }

  return parseRawGithubRepositoryDataArray(data.items)
}

async function parseRawGithubRepositoryDataArray(rawDataArray: any[]): Promise<(GitRepository | undefined)[]> {
  return Promise.all(rawDataArray.map(async (rawData) => {
    return parseRawGithubRepositoryData(rawData).catch(error => {
      console.log(error)
      return undefined
    })
  }))
}

async function parseRawGithubRepositoryData(rawData: any): Promise<GitRepository> {
  const fullName = utils.throwCaseNull<string>(rawData.full_name)

  const apiUrl = utils.throwCaseNull<string>(rawData.url)

  const gitUrl = `https://github.com/${fullName}`

  const provider = 'github'

  const hash = utils.createStringHash(fullName)

  return Promise.resolve({
    watchers: utils.throwCaseNull(rawData.watchers_count),
    isTemplate: utils.throwCaseNull(rawData.is_template),
    stars: utils.throwCaseNull(rawData.stargazers_count),
    updatedAt: utils.throwCaseNull(rawData.updated_at),
    createdAt: utils.throwCaseNull(rawData.created_at),
    pushedAt: utils.throwCaseNull(rawData.pushed_at),
    issues: utils.throwCaseNull(rawData.open_issues),
    isPrivate: utils.throwCaseNull(rawData.private),
    language: utils.throwCaseNull(rawData.language),
    providerId: utils.throwCaseNull(rawData.id),
    forks: utils.throwCaseNull(rawData.forks),
    isFork: utils.throwCaseNull(rawData.fork),
    name: utils.throwCaseNull(rawData.name),
    provider,
    fullName,
    gitUrl,
    apiUrl,
    hash,
  })
}