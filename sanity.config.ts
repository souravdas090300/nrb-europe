'use client'

/**
 * @file sanity.config.ts — Sanity Studio configuration
 *
 * Configures the embedded Sanity Studio mounted at `/admin/studio`.
 * Includes:
 *  - Structure Tool with custom desk structure (editorial workflow)
 *  - Vision Tool for GROQ playground (dev only)
 *  - Custom document actions (publish workflow)
 *  - Schema definitions (post, author, category, blockContent, seo)
 *
 * @see {@link src/sanity/schemaTypes/} for schema definitions
 * @see {@link src/sanity/admin/config/deskStructure.ts} for sidebar layout
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
  basePath: '/admin/studio',
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
