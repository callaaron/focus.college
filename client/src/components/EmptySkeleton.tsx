/**
 * Ultra-lightweight skeleton for instant rendering
 * Only 1 DOM node with CSS animation
 */
export function EmptySkeleton() {
  return (
    <div 
      className="fixed inset-0 bg-background flex items-center justify-center"
      style={{ 
        willChange: 'opacity',
        animation: 'fadeIn 150ms ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div 
        className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"
        style={{
          animation: 'spin 0.8s linear infinite'
        }}
      />
    </div>
  );
}
