function LoginWarningModal({ isOpen, onClose }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
        >
            <div
                className="warning-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <h3>Warning</h3>

                <p>
                    Please log in in order to use Favorites.
                </p>

                <button
                    type="button"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default LoginWarningModal;