// Splash screen functionality
document.addEventListener('DOMContentLoaded', function() {
  const splashScreen = document.querySelector('.splash-screen');
  
  // If splash screen exists
  if (splashScreen) {
    // Allow content to load in background while splash is showing
    setTimeout(function() {
      // Add the fade-out class
      splashScreen.classList.add('fade-out');
      
      // Allow the transition to complete and then remove the splash screen from DOM
      setTimeout(function() {
        splashScreen.style.display = 'none';
      }, 800); // Match this to the CSS transition time
    }, 2500); // Show splash for 2.5 seconds
  }
}); 