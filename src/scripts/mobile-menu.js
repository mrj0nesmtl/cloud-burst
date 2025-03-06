/**
 * Mobile Menu Handler
 * 
 * This script handles the mobile menu behavior, ensuring it closes
 * when menu items are clicked.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuItems = document.querySelectorAll('.mobile-menu-item');
  
  // Toggle menu
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      // Toggle aria-expanded for accessibility
      const isOpen = mobileMenu.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      
      // Prevent body scrolling when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }
  
  // Close menu when item is clicked
  if (menuItems && mobileMenu) {
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    if (mobileMenu && 
        mobileMenu.classList.contains('open') && 
        !mobileMenu.contains(event.target) && 
        event.target !== menuToggle) {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
  
  // Handle resize events
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && mobileMenu && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}); 