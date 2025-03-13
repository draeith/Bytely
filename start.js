const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Welcome to Bytely Development Environment');
console.log('----------------------------------------');
console.log('1. Initialize database');
console.log('2. Start backend server');
console.log('3. Start frontend development server');
console.log('4. Start both servers');
console.log('5. Exit');

rl.question('Select an option: ', (answer) => {
  switch(answer) {
    case '1':
      console.log('Initializing database...');
      exec('cd backend && node initDb.js', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
          return;
        }
        console.log(stdout);
        rl.close();
      });
      break;
    
    case '2':
      console.log('Starting backend server...');
      const backend = exec('cd backend && node server.js');
      
      backend.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
      });
      
      backend.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });
      
      rl.close();
      break;
    
    case '3':
      console.log('Starting frontend development server...');
      const frontend = exec('cd frontend && npm start');
      
      frontend.stdout.on('data', (data) => {
        console.log(`Frontend: ${data}`);
      });
      
      frontend.stderr.on('data', (data) => {
        console.error(`Frontend Error: ${data}`);
      });
      
      rl.close();
      break;
    
    case '4':
      console.log('Starting both servers...');
      const backendServer = exec('cd backend && node server.js');
      
      backendServer.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
      });
      
      backendServer.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
      });
      
      setTimeout(() => {
        const frontendServer = exec('cd frontend && npm start');
        
        frontendServer.stdout.on('data', (data) => {
          console.log(`Frontend: ${data}`);
        });
        
        frontendServer.stderr.on('data', (data) => {
          console.error(`Frontend Error: ${data}`);
        });
      }, 2000);
      
      rl.close();
      break;
    
    case '5':
      console.log('Exiting...');
      rl.close();
      break;
    
    default:
      console.log('Invalid option');
      rl.close();
  }
});