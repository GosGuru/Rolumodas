import React from 'react';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Aquí podrías enviar el error a un servicio externo si lo deseas
    if (process.env.NODE_ENV === 'development') {
      console.error('Error capturado por AdminErrorBoundary:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white p-8">
          <div className="bg-gray-900 border-2 border-red-600 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Ha ocurrido un error inesperado</h2>
            <p className="mb-6 text-gray-200">Por favor, recarga la página o contacta al soporte si el problema persiste.</p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AdminErrorBoundary; 