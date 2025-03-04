#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'
import { description, name, version } from '../package.json'
import { mfa } from './mfa'

const main = defineCommand({
  meta: {
    name: name.replace(/^@[a-zA-Z0-9-]+\//, ''),
    description,
    version,
  },
  args: {
    profile: {
      type: 'string',
      description: 'Use a specific AWS profile.',
      default: '',
      alias: 'p',
    },
  },
  run: async ({ args }) => {
    consola.start('Starting multi-factor authentication...')
    const { expiration, profile } = await mfa({ profile: args.profile }).catch(
      (err: unknown) => {
        throw err
      },
    )
    consola.box(`Profile: ${profile}\nExpiration: ${expiration}`)
    consola.success('Authentication successful.')
  },
})

runMain(main)
