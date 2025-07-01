import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Send from './pages/Send'
import MultiSend from './pages/MultiSend'
import ExportKeys from './pages/ExportKeys'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="send" element={<Send />} />
          <Route path="multi-send" element={<MultiSend />} />
          <Route path="export" element={<ExportKeys />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
