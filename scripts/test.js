var spawn = require('child_process').spawn

if(process.env.ENABLE_ZUUL===true){
  return spawn('npm run test-zuul',{ stdio: 'inherit' })
}

spawn('npm run test-local',{ stdio: 'inherit' })
