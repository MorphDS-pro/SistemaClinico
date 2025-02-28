document.addEventListener('DOMContentLoaded', function () {
    const resizers = document.querySelectorAll('.resizer');
    let isResizing = false;
    let lastX;
    let th;

    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            lastX = e.clientX;
            th = e.target.closest('th');
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', stopResizing);
            th.style.transition = 'none';
        });
    });

    function handleMouseMove(e) {
        if (!isResizing) return;

        const dx = e.clientX - lastX;
        const newWidth = th.offsetWidth + dx;

        if (newWidth > 50) { 
            th.style.width = `${newWidth}px`;
            lastX = e.clientX;
        }
    }

    function stopResizing() {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        th.style.transition = 'width 0.2s ease'; 
    }
});