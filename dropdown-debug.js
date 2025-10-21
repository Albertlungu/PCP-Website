// Enhanced Dropdown Debugging Script
console.log('🔍 ENHANCED DROPDOWN DEBUG SCRIPT LOADED');

document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.has-dropdown');
    
    console.log(`📊 Found ${dropdowns.length} dropdown menus`);
    
    dropdowns.forEach((dropdown, index) => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        console.log(`\n📋 Dropdown ${index + 1} (${toggle.textContent}):`);
        console.log('   Parent element:', dropdown);
        console.log('   Toggle:', toggle);
        console.log('   Menu:', menu);
        
        const dropdownStyles = window.getComputedStyle(dropdown);
        const menuStyles = window.getComputedStyle(menu);
        
        console.log('   📐 Parent styles:', {
            position: dropdownStyles.position,
            display: dropdownStyles.display,
            zIndex: dropdownStyles.zIndex
        });
        
        console.log('   📐 Menu styles:', {
            display: menuStyles.display,
            position: menuStyles.position,
            top: menuStyles.top,
            left: menuStyles.left,
            pointerEvents: menuStyles.pointerEvents,
            zIndex: menuStyles.zIndex,
            opacity: menuStyles.opacity
        });
        
        // Log hover events on parent
        dropdown.addEventListener('mouseenter', () => {
            console.log(`\n✅ MOUSE ENTERED parent dropdown ${index + 1}`);
            
            setTimeout(() => {
                const updatedMenuStyles = window.getComputedStyle(menu);
                console.log('   📊 Menu display after enter:', updatedMenuStyles.display);
                console.log('   📊 Menu opacity after enter:', updatedMenuStyles.opacity);
                console.log('   📊 Menu pointer-events after enter:', updatedMenuStyles.pointerEvents);
                console.log('   📊 Menu transform after enter:', updatedMenuStyles.transform);
            }, 100);
        });
        
        dropdown.addEventListener('mouseleave', () => {
            console.log(`❌ MOUSE LEFT parent dropdown ${index + 1}`);
        });
        
        // Log hover events on menu
        menu.addEventListener('mouseenter', (e) => {
            console.log(`\n🎯 MOUSE ENTERED menu ${index + 1}`);
            console.log('   Mouse position:', { x: e.clientX, y: e.clientY });
            
            // Check what elements are at this point
            const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
            console.log('   🔎 Elements at cursor:', elementsAtPoint.map(el => ({
                tag: el.tagName,
                class: el.className,
                pointerEvents: window.getComputedStyle(el).pointerEvents
            })));
        });
        
        menu.addEventListener('mouseleave', (e) => {
            console.log(`🚫 MOUSE LEFT menu ${index + 1}`);
            console.log('   Mouse position on leave:', { x: e.clientX, y: e.clientY });
        });
        
        // Check for gaps - measure distance between toggle and menu
        toggle.addEventListener('mouseenter', () => {
            const toggleRect = toggle.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            
            const gap = menuRect.top - toggleRect.bottom;
            console.log(`\n📏 Gap measurement for dropdown ${index + 1}:`);
            console.log('   Toggle bottom:', toggleRect.bottom);
            console.log('   Menu top:', menuRect.top);
            console.log('   Gap distance:', gap, 'px');
            
            if (gap > 5) {
                console.warn('   ⚠️ WARNING: Gap is too large!');
            }
        });
        
        // Monitor when dropdown becomes visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style') {
                    const display = window.getComputedStyle(menu).display;
                    if (display === 'block') {
                        console.log(`\n👁️ Dropdown ${index + 1} became VISIBLE`);
                        
                        // Check bridge element
                        const bridgeTest = document.elementFromPoint(
                            menu.getBoundingClientRect().left + 10,
                            menu.getBoundingClientRect().top - 5
                        );
                        console.log('   🌉 Element in bridge area:', {
                            tag: bridgeTest?.tagName,
                            class: bridgeTest?.className
                        });
                    }
                }
            });
        });
        
        observer.observe(menu, {
            attributes: true,
            attributeFilter: ['style']
        });
    });
    
    // Check navbar overflow
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        console.log('\n📐 Navbar computed styles:', {
            overflow: window.getComputedStyle(navbar).overflow,
            overflowX: window.getComputedStyle(navbar).overflowX,
            overflowY: window.getComputedStyle(navbar).overflowY,
            position: window.getComputedStyle(navbar).position,
            zIndex: window.getComputedStyle(navbar).zIndex
        });
    }
    
    // Global mouse tracker
    let lastMousePos = { x: 0, y: 0 };
    document.addEventListener('mousemove', (e) => {
        lastMousePos = { x: e.clientX, y: e.clientY };
    });
    
    // Check every 500ms if we're hovering over a dropdown area but it's not showing
    setInterval(() => {
        const elementsAtCursor = document.elementsFromPoint(lastMousePos.x, lastMousePos.y);
        const overDropdown = elementsAtCursor.some(el => 
            el.classList.contains('has-dropdown') || 
            el.classList.contains('dropdown-menu') ||
            el.classList.contains('dropdown-toggle')
        );
        
        if (overDropdown) {
            const visibleMenus = document.querySelectorAll('.dropdown-menu[style*="display: block"], .dropdown-menu[style*="display:block"]');
            if (visibleMenus.length === 0) {
                console.warn('⚠️ Cursor over dropdown area but no menu is visible!');
                console.log('   Elements at cursor:', elementsAtCursor.map(el => el.tagName + '.' + el.className));
            }
        }
    }, 500);
    
    console.log('\n✅ Debug script fully initialized. Hover over dropdowns to see logs.\n');
});
