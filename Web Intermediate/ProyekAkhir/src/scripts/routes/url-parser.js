import { routes } from './routes';
function extractPathnameSegments(path) {
  const cleanPath = path.replace(/^#/, ''); // hapus # di awal
  const splitUrl = cleanPath.split('/').filter(Boolean); // hilangkan elemen kosong

  return {
    resource: splitUrl[0] || null,
    id: splitUrl[1] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '#';

  if (pathSegments.resource) {
    pathname += `/${pathSegments.resource}`;
  }

  if (pathSegments.id) {
    pathname += '/:id';
  }

  return pathname === '#' ? '#/' : pathname;
}

export function getActivePathname() {
  return location.hash.slice(1) || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();

  // Coba cocokkan langsung
  if (routes[`#${pathname}`]) {
    return `#${pathname}`;
  }

  // Cek route dinamis (contoh: /story/:id)
  const pathSegments = extractPathnameSegments(pathname);
  const dynamicPath = constructRouteFromSegments(pathSegments); // hasilnya bisa '#/story/:id'

  if (routes[dynamicPath]) {
    return dynamicPath;
  }

  return '/404';
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
