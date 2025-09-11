import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Producto</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard">Panel</Link></li>
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard/calendar">Calendario</Link></li>
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard/profile">Perfil</Link></li>
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard/alerts">UI</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recursos</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="text-gray-600 dark:text-gray-300 hover:underline" href="#">Documentación</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:underline" href="#">Guías</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:underline" href="#">Estado</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:underline" href="#">Soporte</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Desarrolladores</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard/form-elements">Formularios</Link></li>
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard/basic-tables">Tablas</Link></li>
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard/line-chart">Gráficos</Link></li>
              <li><Link className="text-gray-600 dark:text-gray-300 hover:underline" href="/dashboard/blank">Plantillas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a className="text-gray-600 dark:text-gray-300 hover:underline" href="#">Privacidad</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:underline" href="#">Términos</a></li>
              <li><a className="text-gray-600 dark:text-gray-300 hover:underline" href="#">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a className="text-gray-500 dark:text-gray-400 hover:underline" href="#">Estado</a>
            <a className="text-gray-500 dark:text-gray-400 hover:underline" href="#">Contacto</a>
            <a className="text-gray-500 dark:text-gray-400 hover:underline" href="#">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
