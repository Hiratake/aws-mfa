import { exec as _exec } from 'node:child_process'
import { promisify } from 'util'

export const exec = promisify(_exec)
