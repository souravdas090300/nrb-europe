'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {getDeskStructure} from './src/sanity/admin/config/deskStructure'
import {customDocumentActions} from './src/sanity/admin/plugins/workflow-actions'

export default defineConfig({
  name: 'nrb-europe-admin',
  title: 'NRB Europe - Editorial System',
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({
      structure: getDeskStructure,
    }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
  
  // Customize document actions
  document: {
    actions: customDocumentActions,
  },
})
