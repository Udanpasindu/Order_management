import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { getTotalItems } = useCart();
  
  const navigation = [
    { name: 'Home', href: '/', current: true },
    { name: 'Catalog', href: '/catalog', current: false },
    ...(isAdmin() ? [{ name: 'Admin Dashboard', href: '/admin', current: false }] : []),
  ];

  return (
    <Disclosure as="nav" className="sticky top-0 z-50 glass/60 border-b border-white/10">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[color:var(--color-brand)]">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--color-brand)] to-[color:var(--color-accent)] font-bold text-xl">Furniture Shop</span>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current ? 'text-gray-900 bg-gray-100' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                          'rounded-md px-3 py-2 text-sm font-medium transition-colors'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Link to="/cart" className="relative rounded-full p-1 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:ring-offset-2">
                  <span className="sr-only">View cart</span>
                  <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[color:var(--color-brand)] rounded-full">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <UserIcon className="h-6 w-6 text-gray-600 hover:text-gray-900" aria-hidden="true" />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white/90 backdrop-blur shadow-lg ring-1 ring-black/5 focus:outline-none">
                      {isAuthenticated ? (
                        <>
                          <Menu.Item>
              <div className="block px-4 py-3 text-sm text-gray-700">
                              Signed in as <span className="font-bold">{user?.name}</span>
                            </div>
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  logout();
                                }}
                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 rounded-b-xl')}
                              >
                                Sign out
                              </a>
                            )}
                          </Menu.Item>
                        </>
                      ) : (
                        <>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/login"
                className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700 rounded-b-xl')}
                              >
                                Sign in
                              </Link>
                            )}
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

      <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
          item.current ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          'block rounded-md px-3 py-2 text-base font-medium transition-colors'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
