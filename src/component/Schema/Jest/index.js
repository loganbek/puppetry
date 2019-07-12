import { RUNNER_PUPPETRY } from "constant";

const NETWORK_TIMEOUT = 50000,

      normalizeName = ( str ) => {
        const re = /[^a-zA-Z0-9_-]/g;
        return str.replace( re, "--" );
      };

export const tplQuery = ({ target, selector }) => {
  return `const ${target} = async () => bs.query( ${ JSON.stringify( selector )}, `
    + `${ JSON.stringify( target )} );`;
};

function buildEnv( env ) {
  if ( !env || !env.variables ) {
    return "";
  }
  const body = Object.entries( env.variables )
    .map( ([ k, v ]) => `  "${ k }": "${ v }"` )
    .join( ",\n" );
  return `// Environment variables
const ENV = {
${ body }
};`;
}

export const tplSuite = ({ title, body, targets, suite, runner, screenshotDirectory, env }) => `
/**
 * Generated by https://github.com/dsheiko/puppetry
 * on ${ String( Date() ) }
 * Suite: ${ suite.title }
 */

${ runner !== RUNNER_PUPPETRY ? `var nVer = process.version.match( /^v(\\d+)/ );
if ( !nVer || nVer[ 1 ] < 9 ) {
  console.error( "WARNING: You have an outdated Node.js version " + process.version
    + ". You need at least v.9.x to run this test suite." );
}
` : `` }

const {
        bs, util, fetch, localStorage
      } = require( "../lib/bootstrap" )( ${ JSON.stringify( normalizeName( title ) ) } ),
      devices = require( "puppeteer/DeviceDescriptors" );

${ runner === RUNNER_PUPPETRY ? `
util.setPngBasePath( ${ JSON.stringify( screenshotDirectory ) } );
` : `` }

jest.setTimeout( ${ suite.timeout || NETWORK_TIMEOUT} );

util.cleanupScreenshotsDir();

${ buildEnv( env ) }

${ targets }

describe( ${ JSON.stringify( title ) }, async () => {
  beforeAll(async () => {
    await bs.setup();
  });

  afterAll(async () => {
    await bs.teardown();
  });

${body}

});
`;

export const tplGroup = ({ title, body }) => `
  describe( ${ JSON.stringify( title ) }, async () => {
${body}
  });
`;

export const tplTest = ({ title, body }) => `
    test( ${ JSON.stringify( title ) }, async () => {
      let result, assert;
${body}
    });
`;