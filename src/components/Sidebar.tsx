import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/send', label: 'Send', icon: '📤' },
    { path: '/multi-send', label: 'Multi Send', icon: '📨' },
    { path: '/export', label: 'Export Keys', icon: '🔑' },
  ]

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">Octra Wallet</h1>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}