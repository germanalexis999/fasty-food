import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {esESLocale} from '@sanity/locale-es-es';
import {schemaTypes,structure} from './schema.js';

const projectId=process.env.SANITY_STUDIO_PROJECT_ID;
if(!projectId)throw new Error('Falta conectar tu proyecto Sanity. Ejecutá npm run configure desde la carpeta principal.');

export default defineConfig({
 name:'fastyfood',title:'FastyFood · Administrar menú',projectId,
 dataset:process.env.SANITY_STUDIO_DATASET||'production',
 plugins:[structureTool({structure}),esESLocale()],
 schema:{types:schemaTypes},
 document:{
  newDocumentOptions:(options)=>options.filter(o=>o.templateId!=='settings'),
  actions:(actions,context)=>context.schemaType==='settings'?actions.filter(a=>!['delete','duplicate','unpublish'].includes(a.action)):actions,
 },
});
