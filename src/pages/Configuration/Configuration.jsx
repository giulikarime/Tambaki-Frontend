import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Search,
  Monitor,
  Tablet,
  Printer,
  Accessibility,
  Clock,
  RotateCcw,
  Info,
  X,
  Check,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import Header from "../../components/HeaderAndSidebar/Header";
import Sidebar from "../../components/HeaderAndSidebar/Sidebar";
import logoTambaki from "../../assets/Tambaki_Prototype.png";
import "./configuration.css";

export default function Configuration() {
  const navigate = useNavigate();

  const [expanded, setExpand] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [openSections, setOpenSections] = useState({
    devices: false,
    accessibility: false,
    dateTime: false,
    reset: false,
    about: false,
  });

  const [terminals, setTerminals] = useState([
    { id: 1, name: "Caixa - Balcão 1", time: "Conectado há 6 horas", status: "Conectado", type: "terminal" },
    { id: 2, name: "Tablet - Garçom 2", time: "Conectado há 40 min", status: "Conectado", type: "tablet" },
    { id: 3, name: "Tablet - Garçom 3", time: "Conectado há 2 horas", status: "Conectado", type: "tablet" },
  ]);

  const [printers, setPrinters] = useState([
    { id: 1, name: "Impressora - Cozinha", status: "Offline", type: "printer" },
    { id: 2, name: "Impressora - Comprovantes", status: "Conectado", type: "printer" },
  ]);

  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [newDeviceType, setNewDeviceType] = useState("terminal");

  const [textSize, setTextSize] = useState("M");
  const [contrastEnabled, setContrastEnabled] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  const [systemLanguage, setSystemLanguage] = useState("pt-BR");
  const [autoDateTime, setAutoDateTime] = useState(true);
  const [timeZone, setTimeZone] = useState("Brasília (GMT-3)");

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [legalModalContent, setLegalModalContent] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddDevice = (e) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    if (newDeviceType === "printer") {
      setPrinters((prev) => [
        ...prev,
        { id: Date.now(), name: newDeviceName.trim(), status: "Conectado", type: "printer" },
      ]);
    } else if (newDeviceType === "tablet") {
      setTerminals((prev) => [
        ...prev,
        { id: Date.now(), name: newDeviceName.trim(), time: "Conectado agora", status: "Conectado", type: "tablet" },
      ]);
    } else {
      setTerminals((prev) => [
        ...prev,
        { id: Date.now(), name: newDeviceName.trim(), time: "Conectado agora", status: "Conectado", type: "terminal" },
      ]);
    }

    showToast(`Dispositivo "${newDeviceName}" adicionado com sucesso!`);
    setNewDeviceName("");
    setNewDeviceType("terminal");
    setIsAddDeviceModalOpen(false);
  };

  const handleCheckUpdates = () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      showToast("O sistema já está atualizado na versão mais recente (v2.1.4).");
    }, 1200);
  };

  const handleConfirmReset = () => {
    setTextSize("M");
    setContrastEnabled(false);
    setScreenReaderEnabled(false);
    setSystemLanguage("pt-BR");
    setAutoDateTime(true);
    setTimeZone("Brasília (GMT-3)");
    setIsResetModalOpen(false);
    showToast("Todas as configurações foram redefinidas para os padrões de fábrica!");
  };

  const searchNormalized = searchQuery.trim().toLowerCase();

  const isSectionVisible = (sectionKey, keywords) => {
    if (!searchNormalized) return true;
    return keywords.some((kw) => kw.toLowerCase().includes(searchNormalized));
  };

  const isSectionExpanded = (sectionKey, keywords) => {
    if (searchNormalized && keywords.some((kw) => kw.toLowerCase().includes(searchNormalized))) {
      return true;
    }
    return openSections[sectionKey];
  };

  return (
    <div className="config-root-container">
      {toastMessage && (
        <div className="config-toast animate-slide-in">
          <CheckCircle2 size={20} color="#15803d" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Header expanded={expanded} setExpand={setExpand} setHasInteracted={setHasInteracted} />

      <div className="config-workspace">
        <Sidebar expanded={expanded} hasInteracted={hasInteracted} />

        <div className="config-scroll-area">
          <div className="config-top-bar">
            <button
              className="config-back-circle-btn"
              onClick={()=>navigate(-1)}
              title="Voltar"
              aria-label="Voltar para tela anterior"
            >
              <ChevronLeft size={20} color="#ffffff" strokeWidth={2.5} />
            </button>
            <h1 className="config-page-heading">Configurações</h1>
          </div>

          <div className="config-main-card">

            <div className="config-search-wrapper">
              <Search className="config-search-icon" size={18} />
              <input
                type="text"
                className="config-search-field"
                placeholder="Pesquisar configuração..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="config-search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  title="Limpar busca"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <p className="config-unit-subtitle">
              Seu perfil é gerenciado pela unidade XYZ
            </p>

            <div className="config-accordion-list">
              {isSectionVisible("devices", ["dispositivos", "conectados", "terminais", "caixa", "tablet", "impressoras", "balcão", "garçom"]) && (
                <div className="config-accordion-item">
                  <button
                    type="button"
                    className="config-accordion-header"
                    onClick={() => toggleSection("devices")}
                    aria-expanded={isSectionExpanded("devices", ["dispositivos", "conectados", "terminais", "caixa", "tablet", "impressoras"])}
                  >
                    <div className="config-header-title-group">
                      <Monitor size={22} className="config-item-icon" />
                      <span className="config-item-label">Dispositivos Conectados</span>
                    </div>
                    <div className="config-header-arrow">
                      {isSectionExpanded("devices", ["dispositivos", "conectados", "terminais", "caixa", "tablet", "impressoras"]) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                  </button>

                  {isSectionExpanded("devices", ["dispositivos", "conectados", "terminais", "caixa", "tablet", "impressoras"]) && (
                    <div className="config-accordion-body animate-fade-down">
                      <div className="config-group-heading">TERMINAIS</div>
                      <div className="config-device-list">
                        {terminals.map((item) => (
                          <div key={item.id} className="config-device-row">
                            <div className="config-device-info">
                              <div className="config-device-icon-box">
                                {item.type === "tablet" ? (
                                  <Tablet size={20} color="#1e1944" />
                                ) : (
                                  <Monitor size={20} color="#1e1944" />
                                )}
                              </div>
                              <div className="config-device-text">
                                <span className="config-device-name">{item.name}</span>
                                <span className="config-device-meta">{item.time}</span>
                              </div>
                            </div>
                            <span className="config-badge config-badge-connected">
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="config-section-divider" />

                      <div className="config-group-heading">IMPRESSORAS</div>
                      <div className="config-device-list">
                        {printers.map((item) => (
                          <div key={item.id} className="config-device-row">
                            <div className="config-device-info">
                              <div className="config-device-icon-box">
                                <Printer size={20} color="#1e1944" />
                              </div>
                              <div className="config-device-text">
                                <span className="config-device-name">{item.name}</span>
                              </div>
                            </div>
                            <span
                              className={`config-badge ${item.status === "Offline"
                                ? "config-badge-offline"
                                : "config-badge-connected"
                                }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="config-add-device-wrap">
                        <button
                          type="button"
                          className="config-primary-pill-btn"
                          onClick={() => setIsAddDeviceModalOpen(true)}
                        >
                          Adicionar Dispositivo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isSectionVisible("accessibility", ["acessibilidade", "texto", "tamanho", "contraste", "leitores de tela"]) && (
                <div className="config-accordion-item">
                  <button
                    type="button"
                    className="config-accordion-header"
                    onClick={() => toggleSection("accessibility")}
                    aria-expanded={isSectionExpanded("accessibility", ["acessibilidade", "texto", "tamanho", "contraste", "leitores de tela"])}
                  >
                    <div className="config-header-title-group">
                      <Accessibility size={22} className="config-item-icon" />
                      <span className="config-item-label">Acessibilidade</span>
                    </div>
                    <div className="config-header-arrow">
                      {isSectionExpanded("accessibility", ["acessibilidade", "texto", "tamanho", "contraste", "leitores de tela"]) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                  </button>

                  {isSectionExpanded("accessibility", ["acessibilidade", "texto", "tamanho", "contraste", "leitores de tela"]) && (
                    <div className="config-accordion-body animate-fade-down">
                      <p className="config-body-hint">
                        Essas preferências valem para todos os terminais em que você estiver logado.
                      </p>

                      <div className="config-preference-row">
                        <span className="config-preference-title">TAMANHO DO TEXTO</span>
                        <div className="config-font-segments">
                          {["P", "M", "G"].map((size) => (
                            <button
                              key={size}
                              type="button"
                              className={`config-font-btn ${textSize === size ? "active" : ""}`}
                              onClick={() => {
                                setTextSize(size);
                                showToast(`Tamanho do texto alterado para: ${size === "P" ? "Pequeno" : size === "M" ? "Médio" : "Grande"}`);
                              }}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="config-section-divider" />

                      <div className="config-preference-row config-toggle-row">
                        <div className="config-toggle-text">
                          <span className="config-preference-title">CONTRASTE</span>
                          <p className="config-preference-sub">
                            Aumenta o contraste entre texto e fundo para facilitar a leitura sob luz forte.
                          </p>
                        </div>
                        <label className="config-switch-control" aria-label="Alternar contraste">
                          <input
                            type="checkbox"
                            checked={contrastEnabled}
                            onChange={(e) => {
                              setContrastEnabled(e.target.checked);
                              showToast(e.target.checked ? "Alto contraste ativado" : "Contraste padrão ativado");
                            }}
                          />
                          <span className="config-switch-slider"></span>
                        </label>
                      </div>

                      <div className="config-section-divider" />

                      <div className="config-preference-row config-toggle-row">
                        <div className="config-toggle-text">
                          <span className="config-preference-title">OTIMIZAR PARA LEITORES DE TELA</span>
                          <p className="config-preference-sub">
                            Reordena avisos e status para leitura sequencial em softwares leitores de tela.
                          </p>
                        </div>
                        <label className="config-switch-control" aria-label="Alternar leitores de tela">
                          <input
                            type="checkbox"
                            checked={screenReaderEnabled}
                            onChange={(e) => {
                              setScreenReaderEnabled(e.target.checked);
                              showToast(e.target.checked ? "Otimização para leitores ativada" : "Otimização para leitores desativada");
                            }}
                          />
                          <span className="config-switch-slider"></span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isSectionVisible("dateTime", ["hora", "idioma", "data", "fuso", "relógio", "língua", "horário"]) && (
                <div className="config-accordion-item">
                  <button
                    type="button"
                    className="config-accordion-header"
                    onClick={() => toggleSection("dateTime")}
                    aria-expanded={isSectionExpanded("dateTime", ["hora", "idioma", "data", "fuso", "relógio", "língua", "horário"])}
                  >
                    <div className="config-header-title-group">
                      <Clock size={22} className="config-item-icon" />
                      <span className="config-item-label">Hora e idioma</span>
                    </div>
                    <div className="config-header-arrow">
                      {isSectionExpanded("dateTime", ["hora", "idioma", "data", "fuso", "relógio", "língua", "horário"]) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                  </button>

                  {isSectionExpanded("dateTime", ["hora", "idioma", "data", "fuso", "relógio", "língua", "horário"]) && (
                    <div className="config-accordion-body animate-fade-down">

                      <div className="config-group-heading">IDIOMA</div>
                      <div className="config-select-row">
                        <span className="config-field-label">Idioma do Sistema</span>
                        <div className="config-select-wrapper">
                          <select
                            value={systemLanguage}
                            onChange={(e) => {
                              setSystemLanguage(e.target.value);
                              showToast("Idioma do sistema atualizado.");
                            }}
                            className="config-custom-select"
                          >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                          </select>
                          <ChevronDown size={16} className="config-select-chevron" />
                        </div>
                      </div>

                      <div className="config-section-divider" />


                      <div className="config-group-heading">DATA E HORA</div>
                      <div className="config-preference-row config-toggle-row">
                        <div className="config-auto-time-info">
                          <div className="config-time-icon-wrapper">
                            <Clock size={20} color="#1e1944" />
                          </div>
                          <div>
                            <span className="config-device-name">Definir Automaticamente</span>
                            <p className="config-device-meta">Usa data e hora do dispositivo</p>
                          </div>
                        </div>
                        <label className="config-switch-control" aria-label="Definir data e hora automaticamente">
                          <input
                            type="checkbox"
                            checked={autoDateTime}
                            onChange={(e) => {
                              setAutoDateTime(e.target.checked);
                              showToast(e.target.checked ? "Sincronização automática ativada" : "Sincronização automática desativada");
                            }}
                          />
                          <span className="config-switch-slider">
                            {autoDateTime && <Check size={12} className="config-slider-check-icon" />}
                          </span>
                        </label>
                      </div>

                      <div className="config-accent-bar" />

                      <div className="config-select-row">
                        <span className="config-field-label">Fuso Horário</span>
                        <div className="config-select-wrapper">
                          <select
                            value={timeZone}
                            onChange={(e) => {
                              setTimeZone(e.target.value);
                              showToast(`Fuso horário definido para: ${e.target.value}`);
                            }}
                            className="config-custom-select"
                          >
                            <option value="Brasília (GMT-3)">Brasília (GMT-3)</option>
                            <option value="Manaus (GMT-4)">Manaus (GMT-4)</option>
                            <option value="Fernando de Noronha (GMT-2)">Fernando de Noronha (GMT-2)</option>
                            <option value="Rio Branco (GMT-5)">Rio Branco (GMT-5)</option>
                          </select>
                          <ChevronDown size={16} className="config-select-chevron" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isSectionVisible("reset", ["redefinir", "configurações", "restaurar", "padrões", "reset"]) && (
                <div className="config-accordion-item">
                  <button
                    type="button"
                    className="config-accordion-header"
                    onClick={() => toggleSection("reset")}
                    aria-expanded={isSectionExpanded("reset", ["redefinir", "configurações", "restaurar", "padrões", "reset"])}
                  >
                    <div className="config-header-title-group">
                      <RotateCcw size={22} className="config-item-icon" />
                      <span className="config-item-label">Redefinir configurações</span>
                    </div>
                    <div className="config-header-arrow">
                      {isSectionExpanded("reset", ["redefinir", "configurações", "restaurar", "padrões", "reset"]) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                  </button>

                  {isSectionExpanded("reset", ["redefinir", "configurações", "restaurar", "padrões", "reset"]) && (
                    <div className="config-accordion-body animate-fade-down">
                      <p className="config-body-hint">
                        Restaure as configurações padrão do sistema nesta unidade. Esta ação reverterá preferências de exibição, idioma e conexões locais para os valores originais.
                      </p>
                      <div className="config-reset-action-box">
                        <button
                          type="button"
                          className="config-danger-pill-btn"
                          onClick={() => setIsResetModalOpen(true)}
                        >
                          Redefinir Configurações
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isSectionVisible("about", ["sobre", "versão", "tambaki", "senai", "legal", "termos", "suporte", "atualizações"]) && (
                <div className="config-accordion-item">
                  <button
                    type="button"
                    className="config-accordion-header"
                    onClick={() => toggleSection("about")}
                    aria-expanded={isSectionExpanded("about", ["sobre", "versão", "tambaki", "senai", "legal", "termos", "suporte", "atualizações"])}
                  >
                    <div className="config-header-title-group">
                      <Info size={22} className="config-item-icon" />
                      <span className="config-item-label">Sobre</span>
                    </div>
                    <div className="config-header-arrow">
                      {isSectionExpanded("about", ["sobre", "versão", "tambaki", "senai", "legal", "termos", "suporte", "atualizações"]) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </div>
                  </button>

                  {isSectionExpanded("about", ["sobre", "versão", "tambaki", "senai", "legal", "termos", "suporte", "atualizações"]) && (
                    <div className="config-accordion-body animate-fade-down config-about-section-body">

                      <div className="config-about-hero">
                        <div className="config-about-logo-circle">
                          <img src={logoTambaki} alt="Logo Tambaki" className="config-about-logo-img" />
                        </div>
                        <h2 className="config-about-app-title">Tambaki - Gestão de Restaurantes</h2>
                        <span className="config-about-version-tag">Versão 2.1.4</span>
                      </div>

                      <div className="config-group-heading">INFORMAÇÕES</div>
                      <div className="config-about-info-row">
                        <span className="config-field-label">Desenvolvido por</span>
                        <span className="config-about-info-val">Tambaki - Equipe da TDS Senai Mariano Ferraz</span>
                      </div>
                      <div className="config-about-info-row">
                        <span className="config-field-label">Verificar Atualizações</span>
                        <button
                          type="button"
                          className="config-outline-pill-btn"
                          onClick={handleCheckUpdates}
                          disabled={isCheckingUpdate}
                        >
                          {isCheckingUpdate ? "Verificando..." : "Verificar"}
                        </button>
                      </div>

                      <div className="config-section-divider" />

                      <div className="config-group-heading">LEGAL</div>
                      <div className="config-about-links-list">
                        <button
                          type="button"
                          className="config-about-text-link"
                          onClick={() =>
                            setLegalModalContent({
                              title: "Termos de Uso",
                              text: "Estes Termos de Uso regulam a utilização do sistema Tambaki para gestão de bares e restaurantes. O uso do software implica em conformidade integral com as diretrizes de operação da sua unidade.",
                            })
                          }
                        >
                          Termos de Uso
                        </button>
                        <button
                          type="button"
                          className="config-about-text-link"
                          onClick={() =>
                            setLegalModalContent({
                              title: "Política de Privacidade",
                              text: "O Tambaki adota práticas rigorosas de proteção e sigilo de dados em conformidade com a LGPD (Lei Geral de Proteção de Dados). As informações operacionais de pedidos e comitentes são processadas com segurança criptográfica.",
                            })
                          }
                        >
                          Política de Privacidade
                        </button>
                        <button
                          type="button"
                          className="config-about-text-link"
                          onClick={() =>
                            setLegalModalContent({
                              title: "Licenças de Terceiros",
                              text: "O projeto Tambaki utiliza bibliotecas de código aberto sob licenças padrão permissivas (MIT, Apache 2.0). Agradecimentos aos projetos React, Lucide Icons, Vite e Tailwind CSS.",
                            })
                          }
                        >
                          Licenças de Terceiros
                        </button>
                      </div>

                      <div className="config-section-divider" />


                      <div className="config-group-heading">SUPORTE</div>
                      <div className="config-about-support-box">
                        <a href="mailto:suporte@tambaki.com" className="config-support-mail-link">
                          suporte@tambaki.com
                        </a>
                        <a href="tel:1187234436" className="config-support-phone-link">
                          (11) 8723-4436
                        </a>
                      </div>

                      <div className="config-section-divider" />


                      <p className="config-copyright-footer">
                        © 2026 Tambaki - Equipe da TDS Senai Mariano Ferraz. Todos os direitos reservados.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {isAddDeviceModalOpen && (
        <div className="config-modal-backdrop" onClick={() => setIsAddDeviceModalOpen(false)}>
          <div className="config-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="config-modal-header">
              <h3>Adicionar Dispositivo</h3>
              <button
                type="button"
                className="config-modal-close-btn"
                onClick={() => setIsAddDeviceModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddDevice} className="config-modal-form">
              <div className="config-modal-field">
                <label>Nome do Dispositivo</label>
                <input
                  type="text"
                  placeholder="Ex: Tablet - Garçom 4 ou Impressora - Bar"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="config-modal-field">
                <label>Tipo de Dispositivo</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                >
                  <option value="terminal">Terminal / Caixa</option>
                  <option value="tablet">Tablet de Garçom</option>
                  <option value="printer">Impressora Térmica</option>
                </select>
              </div>

              <div className="config-modal-actions">
                <button
                  type="button"
                  className="config-secondary-btn"
                  onClick={() => setIsAddDeviceModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="config-primary-pill-btn">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="config-modal-backdrop" onClick={() => setIsResetModalOpen(false)}>
          <div className="config-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="config-modal-header">
              <div className="config-modal-warning-title">
                <AlertTriangle size={24} color="#dc2626" />
                <h3>Redefinir Configurações</h3>
              </div>
              <button
                type="button"
                className="config-modal-close-btn"
                onClick={() => setIsResetModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="config-modal-body">
              <p>
                Tem certeza de que deseja redefinir todas as preferências de exibição, acessibilidade e idioma desta unidade para os valores padrão de fábrica?
              </p>
              <p className="config-modal-sub-warning">
                Essa ação não pode ser desfeita.
              </p>
            </div>
            <div className="config-modal-actions">
              <button
                type="button"
                className="config-secondary-btn"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="config-danger-pill-btn"
                onClick={handleConfirmReset}
              >
                Sim, Redefinir
              </button>
            </div>
          </div>
        </div>
      )}

      {legalModalContent && (
        <div className="config-modal-backdrop" onClick={() => setLegalModalContent(null)}>
          <div className="config-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="config-modal-header">
              <h3>{legalModalContent.title}</h3>
              <button
                type="button"
                className="config-modal-close-btn"
                onClick={() => setLegalModalContent(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="config-modal-body">
              <p>{legalModalContent.text}</p>
            </div>
            <div className="config-modal-actions">
              <button
                type="button"
                className="config-primary-pill-btn"
                onClick={() => setLegalModalContent(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}