import Modal from "react-modal";

function AlertModal({ phrase, isOpen, setIsOpen, type }) {
    const isError = type === "error";

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            contentLabel={isError ? "Erro" : "Sucesso"}
            style={{
                overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1000,
                },
                content: {
                    inset: "50% auto auto 50%",
                    transform: "translate(-50%, -50%)",
                    width: "min(420px, calc(100% - 32px))",
                    height: "fit-content",
                    borderRadius: "12px",
                    padding: "24px",
                },
            }}
        >
            <div role={isError ? "alert" : "status"}>
                <p>{phrase}</p>
                <button type="button" onClick={() => setIsOpen(false)}>
                    Fechar
                </button>
            </div>
        </Modal>
    );
}

export default AlertModal;
