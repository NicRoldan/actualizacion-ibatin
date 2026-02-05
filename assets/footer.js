// Footer compartido para todas las páginas de IBATÍN
function loadFooter() {
    // Detectar si estamos en una subcarpeta
    const path = window.location.pathname;
    const isSubfolder = path.includes('/proyectos/') || 
                        path.includes('/bitacora/') || 
                        path.includes('/participa/') || 
                        path.includes('/seccion%202/') ||
                        path.includes('/seccion 2/');
    
    const basePath = isSubfolder ? '../' : '';
    
    const footerHTML = `
    <footer class="bg-primary-darker py-16 border-t border-primary-dark/20" id="contacto">
        <div class="max-w-[1280px] mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <!-- Logo y descripción -->
                <div class="col-span-1 md:col-span-1 flex flex-col gap-6">
                    <div class="flex items-center gap-3">
                        <img src="${basePath}assets/logo-ibatin.png" alt="Logo IBATÍN" class="h-10 w-auto">
                    </div>
                    <p class="text-white/60 text-sm">
                        Fundación IBATÍN: Gobernanza, planificación y ciudadanía en el Área Metropolitana de Tucumán. Mutar en vez de migrar.
                    </p>
                    <a href="https://www.instagram.com/ibatinorg/" target="_blank" class="inline-flex items-center gap-2 text-white/60 hover:text-primary transition-colors mt-2">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd"/></svg>
                        <span class="text-sm">@ibatinorg</span>
                    </a>
                </div>
                <!-- Explorar -->
                <div>
                    <h5 class="text-white font-bold mb-6">Explorar</h5>
                    <ul class="flex flex-col gap-4 text-white/60 text-sm">
                        <li><a class="hover:text-primary transition-colors" href="${basePath}seccion 2/index.html">Pensar el AMeT</a></li>
                        <li><a class="hover:text-primary transition-colors" href="${basePath}index.html#areas">Áreas Estratégicas</a></li>
                        <li><a class="hover:text-primary transition-colors cursor-pointer" onclick="explorarDatos()">Mapa de Datos</a></li>
                        <li><a class="hover:text-primary transition-colors" href="${basePath}proyectos/index.html#ciudadania">Gobierno Abierto</a></li>
                    </ul>
                </div>
                <!-- Participá -->
                <div>
                    <h5 class="text-white font-bold mb-6">Participá</h5>
                    <ul class="flex flex-col gap-4 text-white/60 text-sm">
                        <li><a class="hover:text-primary transition-colors" href="${basePath}participa/index.html">Ciudadanía Activa</a></li>
                        <li><a class="hover:text-primary transition-colors cursor-pointer" onclick="openVoluntarioForm()">Voluntariado</a></li>
                        <li><a class="hover:text-primary transition-colors cursor-pointer" onclick="openContactoForm()">Prensa</a></li>
                        <li><a class="hover:text-primary transition-colors cursor-pointer" onclick="openContactoForm()">Contacto</a></li>
                    </ul>
                </div>
                <!-- Newsletter -->
                <div>
                    <h5 class="text-white font-bold mb-6">Newsletter</h5>
                    <p class="text-white/60 text-sm mb-4">Recibí las últimas novedades del AMeT.</p>
                    <form class="flex gap-2">
                        <input class="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-primary text-white placeholder-white/40" placeholder="Tu email" type="email" required/>
                        <button type="submit" class="bg-primary text-primary-darker px-4 py-2 rounded-lg hover:brightness-110 transition-all">
                            <span class="material-symbols-outlined !text-base">send</span>
                        </button>
                    </form>
                </div>
            </div>
            <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-center items-center gap-4 text-white/50 text-xs">
                <p>© 2026 Fundación IBATÍN – Tucumán, Argentina. <a href="https://argentino.click" target="_blank" class="hover:text-primary transition-colors">Click Argentino</a>. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
    `;
    
    // Insertar el footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = footerHTML;
    } else {
        // Si no hay contenedor, reemplazar el footer existente o añadir antes del cierre del body
        const existingFooter = document.querySelector('footer');
        if (existingFooter) {
            existingFooter.outerHTML = footerHTML;
        } else {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }
}

// Cargar footer cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadFooter);
