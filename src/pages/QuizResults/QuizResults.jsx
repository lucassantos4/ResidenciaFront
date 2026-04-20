import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import '../../index.css';
import '../../assets/css/RoomConfig.css';
import './QuizResults.css';

const QuizResults = () => {
  const navigate = useNavigate();
  const { code } = useParams();

  const facilitadorToken = localStorage.getItem('facilitadorToken');

  const [companies, setCompanies] = useState([]);
  const [quizRows, setQuizRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!facilitadorToken) {
      navigate('/lobby');
      return;
    }

    const fetchCompanies = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/companies/${code}`);

        if (!response.ok) {
          throw new Error('Nao foi possivel carregar as empresas da sala.');
        }

        const data = await response.json();
        setCompanies(data);

        const initialRows = data.map((company) => ({
          companyId: company.id,
          companyName: company.name,
          managerName: company.managerName || '',
          correctAnswers: '',
          totalQuestions: '',
        }));

        setQuizRows(initialRows);
      } catch (error) {
        console.error(error);
        setWarningMessage(error.message || 'Erro ao carregar empresas.');
        setWarning(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [code, facilitadorToken, navigate]);

  const completedCount = useMemo(() => {
    return quizRows.filter(
      (row) => row.correctAnswers !== '' && row.totalQuestions !== ''
    ).length;
  }, [quizRows]);

  const totalCorrectAnswers = useMemo(() => {
    return quizRows.reduce((sum, row) => sum + (Number(row.correctAnswers) || 0), 0);
  }, [quizRows]);

  const handleRowChange = (companyId, field, value) => {
    const numericValue = value === '' ? '' : Math.max(0, Number(value));

    setQuizRows((prev) =>
      prev.map((row) => {
        if (row.companyId !== companyId) {
          return row;
        }

        const updatedRow = {
          ...row,
          [field]: numericValue,
        };

        if (
          field === 'totalQuestions' &&
          updatedRow.correctAnswers !== '' &&
          Number(updatedRow.correctAnswers) > Number(numericValue)
        ) {
          updatedRow.correctAnswers = numericValue;
        }

        return updatedRow;
      })
    );
  };

  const validateRows = () => {
    if (quizRows.length === 0) {
      return 'Nenhuma empresa foi encontrada para esta sala.';
    }

    for (const row of quizRows) {
      if (row.correctAnswers === '' || row.totalQuestions === '') {
        return `Preencha acertos e total de perguntas para ${row.companyName}.`;
      }

      if (Number(row.correctAnswers) > Number(row.totalQuestions)) {
        return `Os acertos da empresa ${row.companyName} nao podem ser maiores que o total de perguntas.`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateRows();

    if (validationError) {
      setWarningMessage(validationError);
      setWarning(true);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        roomCode: code,
        results: quizRows.map((row) => ({
          companyId: row.companyId,
          companyName: row.companyName,
          correctAnswers: Number(row.correctAnswers),
          totalQuestions: Number(row.totalQuestions),
        })),
      };

      console.log('Payload de resultados do quiz:', payload);
      setShowConfirmModal(true);
    } catch (error) {
      console.error(error);
      setWarningMessage(error.message || 'Erro ao preparar os resultados do quiz.');
      setWarning(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="config-container">
      <aside className="config-sidebar">
        <div className="sidebar-top">
          <h1 className="config-title">Resultados do Quiz</h1>
          <span className="config-title-accent" />
          <p className="config-subtitle">
            Registre o desempenho de cada empresa antes de liberar a proxima etapa da dinamica.
          </p>
        </div>

        <div className="quiz-side-stack">
          <div className="dash-info-card">
            <span className="dash-info-label">Sala</span>
            <strong className="dash-info-value">{code}</strong>
          </div>

          <div className="dash-info-card">
            <span className="dash-info-label">Empresas</span>
            <strong className="dash-info-value">{companies.length}</strong>
          </div>

          <div className="dash-info-card">
            <span className="dash-info-label">Preenchidas</span>
            <strong className="dash-info-value">
              {completedCount} / {quizRows.length}
            </strong>
          </div>

          <div className="quiz-summary-card">
            <span className="quiz-summary-label">Total de acertos lancados</span>
            <strong className="quiz-summary-value">{totalCorrectAnswers}</strong>
            <p className="quiz-summary-text">
              Estrutura pronta para registrar os resultados do quiz enquanto a regra final ainda esta sendo alinhada.
            </p>
          </div>
        </div>
      </aside>

      <div className="config-main">
        {loading && <div className="status-message loading">Carregando empresas...</div>}

        <div className="config-content">
          <section className="config-section">
            <h3 className="section-subtitle">Lancamento dos Resultados</h3>
            <p className="quiz-section-hint">
              Informe quantos acertos cada empresa teve e o total de perguntas consideradas no quiz.
            </p>

            <div className="dash-table quiz-table">
              <div className="dash-table-header quiz-table-header">
                <span>Empresa</span>
                <span className="dash-center">Gerente</span>
                <span className="dash-center">Acertos</span>
                <span className="dash-center">Perguntas</span>
                <span className="dash-center">Aproveitamento</span>
              </div>

              {!loading && quizRows.length === 0 && (
                <div className="dash-table-empty">
                  Nenhuma empresa encontrada para registrar resultados.
                </div>
              )}

              {quizRows.map((row) => {
                const total = Number(row.totalQuestions) || 0;
                const correct = Number(row.correctAnswers) || 0;
                const accuracy = total > 0 ? (correct / total) * 100 : 0;

                return (
                  <div className="dash-table-row quiz-table-row" key={row.companyId}>
                    <div className="quiz-company-cell">
                      <span className="dash-empresa-name">{row.companyName}</span>
                    </div>

                    <span className="dash-center quiz-manager-name">
                      {row.managerName || '—'}
                    </span>

                    <div className="quiz-input-wrap">
                      <input
                        className="quiz-number-input"
                        type="number"
                        min="0"
                        value={row.correctAnswers}
                        onChange={(event) =>
                          handleRowChange(row.companyId, 'correctAnswers', event.target.value)
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="quiz-input-wrap">
                      <input
                        className="quiz-number-input"
                        type="number"
                        min="0"
                        value={row.totalQuestions}
                        onChange={(event) =>
                          handleRowChange(row.companyId, 'totalQuestions', event.target.value)
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="quiz-accuracy-cell">
                      <strong>{accuracy.toFixed(0)}%</strong>
                      <div className="quiz-accuracy-bar">
                        <div
                          className="quiz-accuracy-fill"
                          style={{ width: `${Math.min(accuracy, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="config-section">
            <h3 className="section-subtitle">Proximo Passo</h3>
            <div className="quiz-action-card">
              <p>
                Esta tela ja esta preparada para receber a integracao com o backend. Por enquanto, o botao abaixo valida os campos e monta o payload final no front-end.
              </p>
            </div>
          </section>

          <button className="btn-confirm" onClick={handleSave} disabled={saving || loading}>
            {saving ? 'SALVANDO RESULTADOS...' : 'CONFIRMAR RESULTADOS DO QUIZ'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        type="confirm"
        title="Resultados preparados"
        message="Os resultados do quiz foram validados e organizados. Quando a regra final for definida, aqui entra a chamada de API para persistencia."
        confirmText="Fechar"
        onConfirm={() => setShowConfirmModal(false)}
        onCancel={() => setShowConfirmModal(false)}
      />

      <Modal
        isOpen={warning}
        type="warning"
        title="Atencao"
        message={warningMessage || 'Verifique os dados informados.'}
        confirmText="Entendi"
        onConfirm={() => setWarning(false)}
        onCancel={() => setWarning(false)}
      />
    </div>
  );
};

export default QuizResults;