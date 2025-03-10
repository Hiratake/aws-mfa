#!/usr/bin/env node
import { exit } from 'node:process'
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
    region: {
      type: 'string',
      description: 'Use a specific AWS region.',
      default: '',
    },
    serialNumber: {
      type: 'string',
      description: 'Use a specific MFA device serial number.',
      default: '',
    },
    code: {
      type: 'string',
      description: 'Use a specific 6-digit MFA code.',
      default: '',
      alias: 'c',
    },
    quiet: {
      type: 'boolean',
      description: 'Run in quiet mode, suppressing informational messages.',
      default: false,
      alias: 'q',
    },
  },
  run: async ({ args }) => {
    if (!args.quiet) {
      consola.start('Starting multi-factor authentication...')
    }

    const { expiration, profile } = await mfa({
      profile: args.profile,
      region: args.region,
      serialNumber: args.serialNumber,
      code: args.code,
      quiet: args.quiet,
    }).catch((err: unknown) => {
      if (!args.quiet) {
        throw err
      } else {
        exit(1)
      }
    })

    if (!args.quiet) {
      consola.box(`Profile: ${profile}\nExpiration: ${expiration}`)
      consola.success('Authentication successful.')
    }
  },
})

runMain(main)
