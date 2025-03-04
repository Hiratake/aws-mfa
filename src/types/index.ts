export type MFAOptions = {
  /** 使用するプロファイル名 */
  profile: string
}

export type MFAReturn = {
  /** 作成されたプロファイル名 */
  profile: string
  /** 有効期限 */
  expiration: string
}
