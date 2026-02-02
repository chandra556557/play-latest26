#!/usr/bin/env node

// Utility to display naming convention information
const config = require('./naming-convention-config.json');

console.log('='.repeat(80));
console.log('TEST SCRIPT NAMING CONVENTION');
console.log('='.repeat(80));
console.log('');
console.log('FORMAT: ', config.testNamingConvention.format);
console.log('');
console.log('DESCRIPTION: ', config.testNamingConvention.description);
console.log('');
console.log('FEATURE AREAS: ');
config.testNamingConvention.featureAreas.forEach(area => console.log(`  - ${area}`));
console.log('');
console.log('TEST TYPES: ');
config.testNamingConvention.testTypes.forEach(type => console.log(`  - ${type}`));
console.log('');
console.log('SPECIFIC ACTIONS: ');
config.testNamingConvention.specificActions.forEach(action => console.log(`  - ${action}`));
console.log('');
console.log('ENVIRONMENTS: ');
config.testNamingConvention.environments.forEach(env => console.log(`  - ${env}`));
console.log('');
console.log('EXAMPLES: ');
config.testNamingConvention.examples.forEach(example => {
  console.log(`  - ${example.name}`);
  console.log(`    -> Feature: ${example.featureArea}, Type: ${example.testType}, Action: ${example.specificAction}`);
  if (example.behavior) console.log(`    -> Behavior: ${example.behavior}`);
  if (example.environment) console.log(`    -> Environment: ${example.environment}`);
  console.log('');
});
console.log('Documentation: ', config.testNamingConvention.documentation);
console.log('');
console.log('='.repeat(80));