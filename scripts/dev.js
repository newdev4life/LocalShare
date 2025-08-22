import { spawn } from 'child_process'
import { createServer } from 'vite'
import electron from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function startApp() {
  // 启动 Vite 开发服务器
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
  })
  await server.listen()

  // 启动 Electron
  const proc = spawn(electron, [path.join(__dirname, '../electron/main.cjs')], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  })

  proc.on('close', () => {
    server.close()
    process.exit()
  })
}

startApp()