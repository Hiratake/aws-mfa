import type { MFAOptions, MFAReturn } from './types'
import { consola } from 'consola'
import { exec } from './utils'

export const mfa = async (options: MFAOptions): Promise<MFAReturn> => {
  /** 設定済みプロファイルリスト */
  const profiles = await getProfiles()
  /** 使用するプロファイル名 */
  let profile = options.profile

  if (profile) {
    // 指定されたプロファイルが存在するか確認
    if (!profiles.find((item) => item === profile)) {
      throw new Error('Specified profile not found.')
    }
  } else {
    // プロファイルを選択
    const input = await consola.prompt('Select a profile', {
      type: 'select',
      options: profiles,
    })
    profile = input
  }

  /** 作成するプロファイル名 */
  const mfaProfile = getNewProfileName(profile)
  /** リージョン */
  const region = await (async () => {
    try {
      return await getRegion(profile)
    } catch {
      // リージョンを設定
      const input = await consola.prompt('Enter your region', {
        type: 'text',
        placeholder: 'ap-northeast-1',
      })
      if (!input) {
        throw new Error('Invalid region.')
      }
      const { stderr } = await exec(
        `aws configure set region "${input}" --profile "${profile}"`,
      )
      if (stderr) {
        throw new Error(stderr)
      }
      return input.trim()
    }
  })()
  /** シリアルナンバー */
  const serialNumber = await (async () => {
    try {
      return await getMFASerialNumber(profile)
    } catch {
      // シリアルナンバーを設定
      const input = await consola.prompt('Enter your MFA serial number', {
        type: 'text',
        placeholder: 'arn:aws:iam::123456789012:mfa/user',
      })
      if (!/^arn:aws:iam::\d{12}:mfa\//.test(input)) {
        throw new Error('Invalid MFA serial number.')
      }
      const { stderr } = await exec(
        `aws configure set mfa_serial "${input}" --profile "${profile}"`,
      )
      if (stderr) {
        throw new Error(stderr)
      }
      return input.trim()
    }
  })()
  /** コード */
  const code = await (async () => {
    const input = await consola.prompt('Enter your MFA code', {
      type: 'text',
      placeholder: '123456',
    })
    if (!/^\d{6}$/.test(input)) {
      throw new Error('Invalid MFA code.')
    }
    return input.trim()
  })()

  /** AWS STS による一時的な認証情報 */
  const token = await getToken(profile, serialNumber, code)

  if (
    token.AccessKeyId &&
    token.SecretAccessKey &&
    token.SessionToken &&
    token.Expiration
  ) {
    await exec(
      `aws configure set aws_access_key_id "${token.AccessKeyId}" --profile "${mfaProfile}"`,
    )
    await exec(
      `aws configure set aws_secret_access_key "${token.SecretAccessKey}" --profile "${mfaProfile}"`,
    )
    await exec(
      `aws configure set aws_session_token "${token.SessionToken}" --profile "${mfaProfile}"`,
    )
    await exec(`aws configure set region "${region}" --profile "${mfaProfile}"`)
    await exec(`aws configure set output json --profile "${mfaProfile}"`)
  } else {
    throw new Error('Failed to get temporary credentials.')
  }

  return { profile: mfaProfile, expiration: token.Expiration }
}

const getProfiles = async () => {
  const { stderr, stdout } = await exec('aws configure list-profiles')
  if (stderr) {
    throw new Error(stderr)
  }
  return stdout.split('\n').filter((profile) => profile)
}

const getNewProfileName = (
  profile: MFAOptions['profile'],
): MFAOptions['profile'] => {
  return `${profile}-mfa`
}

const getRegion = async (profile: MFAOptions['profile']): Promise<string> => {
  const { stderr, stdout } = await exec(
    `aws configure get region --profile "${profile}" --output text`,
  )
  if (stderr) {
    throw new Error(stderr)
  }
  return stdout.trim()
}

const getMFASerialNumber = async (
  profile: MFAOptions['profile'],
): Promise<string> => {
  const { stderr, stdout } = await exec(
    `aws configure get mfa_serial --profile "${profile}"`,
  )
  if (stderr) {
    throw new Error(stderr)
  }
  return stdout.trim()
}

const getToken = async (
  profile: MFAOptions['profile'],
  serialNumber: string,
  code: string,
): Promise<{
  AccessKeyId: string
  SecretAccessKey: string
  SessionToken: string
  Expiration: string
}> => {
  const { stderr, stdout } = await exec(
    `aws sts get-session-token --serial-number "${serialNumber}" --token-code "${code}" --query "Credentials" --profile "${profile}" --output json`,
  )
  if (stderr) {
    throw new Error(stderr)
  }
  return JSON.parse(stdout)
}
