import { GitRepository } from './git'
import * as validators from './validators'
import * as output from './output'
import * as shell from './shell'
import * as code from './code'
import * as http from './http'

export type SonarMetrics = {
  bugs: number,
  lines: number,
  smells: number,
}

export const SONAR_SERVER_URL = 'http://localhost:9000'

export const SONAR_SERVER_TOKEN = '***'

export const SONAR_BASIC_TOKEN = '***'

export const SONAR_PROJECT_ANALYSIS_SCOPE = '**/*.ts,**/*.tsx'

export const SONAR_PROJECT_ENCODING = `UTF-8`

export const SONAR_RETRY_TIMEOUT = 5000

export async function collectSonarMetrics(repository: GitRepository): Promise<SonarMetrics> {
  const sonarPropertiesContent = createRepositoryPropertiesContent(repository)
  code.createCodeFile(repository, sonarPropertiesContent, 'sonar-project.properties')
  output.createSonarPropertiesFile(repository, sonarPropertiesContent)

  const sonarScannerOutput = shell.executeRepositoryCommand(repository, 'sonar-scanner')
  output.createSonarLogsFile(repository, sonarScannerOutput)

  const sonarMetrics = await tryToGetProjectMetrics(repository.hash)
  
  output.createSonarMetricsFile(repository, sonarMetrics)

  await deleteProject(repository.hash)

  return sonarMetrics
}

export function createRepositoryPropertiesContent(repository: GitRepository): string {
  return ''
    + `sonar.host.url=${SONAR_SERVER_URL}\n`
    + `sonar.token=${SONAR_SERVER_TOKEN}\n`
    + `sonar.sourceEncoding=${SONAR_PROJECT_ENCODING}\n`
    + `sonar.inclusions=${SONAR_PROJECT_ANALYSIS_SCOPE}\n`
    + `sonar.projectName=${repository.fullName}\n`
    + `sonar.projectKey=${repository.hash}\n`
}

async function tryToGetProjectMetrics(projectId: string, remainingTime: number = SONAR_RETRY_TIMEOUT): Promise<SonarMetrics> {
  const startTime = performance.now()
  try {
    return await getProjectMetrics(projectId)
  } catch(error) {
    if(remainingTime > 0) {

      const timeAfterExecution = performance.now()

      const elapsedExecutionTime = Math.trunc(timeAfterExecution - startTime)
      const recalculatedRemainingTime = Math.trunc(remainingTime - elapsedExecutionTime)

      // console.log(`failed to collect metrics from SonarQube`)
      // console.log(`will try again for more ${recalculatedRemainingTime}ms`)

      return tryToGetProjectMetrics(projectId, recalculatedRemainingTime)

    } else {
      throw new Error(error)
    }
  }
}

export async function getProjectMetrics(projectId: string): Promise<SonarMetrics> {

  const response = await http.request({
    validateStatus: () => true,
    url: `${SONAR_SERVER_URL}/api/measures/search_history`,
    headers: { 'Authorization': `Basic ${SONAR_BASIC_TOKEN}`},
    params: {
      component: projectId,
      metrics: `
        bugs,
        ncloc,
        code_smells,
      `
    },
  })

  if(response.status !== 200) {
    throw new Error(`Error collecting metrics for project ${projectId}`)
  }

  const measures = await validators.array(validators.object({
    metric: validators.string(),
    history: validators.array(validators.object({
      value: validators.string()
    }))
  })).validateAsync(response.data.measures, {
    allowUnknown: true
  }).catch(error => {
    throw new Error(`Could not parse SonarQube API response for project ${projectId}`)
  })

  const metrics = measures.reduce((acc, measure) => {
    const metricKey = {
      'bugs': 'bugs',
      'ncloc': 'lines',
      'code_smells': 'smells',
    }[measure.metric]

    if(!metricKey) {
      return acc
    }

    return { ...acc,
      [metricKey]: Number.parseFloat(measure.history[measure.history.length -1].value) 
    }
  }, {})

  return metrics
}

export async function deleteProject(projectId: string): Promise<void> {
  const response = await http.request({
    validateStatus: () => true,
    method: 'post',
    url: `${SONAR_SERVER_URL}/api/projects/delete`,
    headers: { 
      'Authorization': `Basic ${SONAR_BASIC_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: {
      project: projectId,
    }
  })

  if(response.status !== 204) {
    throw new Error(`Error deleting project ${projectId}`)
  }
}
