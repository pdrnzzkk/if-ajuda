/**
 * IF-Ajuda - Plataforma de Monitoria e Banco de Questões
 * IFSULDEMINAS - Campus Pouso Alegre
 * Grupo de Informática do IFSULDEMINAS - 2026
 *
 * Arquivo: src/config/seedData/materiasIF.js
 * Dataset estático com a grade curricular do campus, usado para popular
 * automaticamente a tabela "materias" caso ela esteja vazia.
 */

export const materiasDoIF = [
  // INFORMÁTICA
  { nome_materia: "Lógica de Programação", curso: "Informática", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Fundamentos de Hardware", curso: "Informática", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Sistemas Operacionais", curso: "Informática", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Softwares e Aplicativos", curso: "Informática", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Linguagem de Programação", curso: "Informática", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Banco de Dados", curso: "Informática", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Redes de Computadores", curso: "Informática", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Programação Web", curso: "Informática", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Tópicos Especiais", curso: "Informática", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },

  // QUÍMICA
  { nome_materia: "Química Geral e Inorgânica", curso: "Química", ano_curricular: 1, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Química Ambiental", curso: "Química", ano_curricular: 1, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Segurança do Trabalho", curso: "Química", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Microbiologia", curso: "Química", ano_curricular: 2, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Físico-Química", curso: "Química", ano_curricular: 2, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Química Analítica I", curso: "Química", ano_curricular: 2, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Operações Unitárias", curso: "Química", ano_curricular: 2, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Química Orgânica", curso: "Química", ano_curricular: 2, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Métodos Instrumentais de Análise", curso: "Química", ano_curricular: 3, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Processos Químicos", curso: "Química", ano_curricular: 3, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Analítica II", curso: "Química", ano_curricular: 3, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Orgânica II", curso: "Química", ano_curricular: 3, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Fundamentos de Biotecnologia", curso: "Química", ano_curricular: 3, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Gestão da Qualidade", curso: "Química", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },

  // EDIFICAÇÕES
  { nome_materia: "Desenho Técnico e Arquitetônico", curso: "Edificações", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Tecnologia das Construções", curso: "Edificações", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Materiais de Construção", curso: "Edificações", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Desenho Assistido por Computador", curso: "Edificações", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Topografia", curso: "Edificações", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Instalações Prediais", curso: "Edificações", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Projeto Arquitetônico", curso: "Edificações", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Sistemas Estruturais", curso: "Edificações", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Orçamento e Práticas de Obras", curso: "Edificações", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Mecânica dos Solos", curso: "Edificações", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Segurança, Patologia e Manutenção", curso: "Edificações", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },

  // ADMINISTRAÇÃO
  { nome_materia: "Introdução à Administração", curso: "Administração", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Gestão de Pessoas", curso: "Administração", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Processos Administrativos", curso: "Administração", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Informática Aplicada", curso: "Administração", ano_curricular: 1, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Marketing", curso: "Administração", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Gestão de Operações", curso: "Administração", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Empreendedorismo", curso: "Administração", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Contabilidade", curso: "Administração", ano_curricular: 2, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Gestão Financeira de Custos", curso: "Administração", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Economia Aplicada", curso: "Administração", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Planejamento Estratégico", curso: "Administração", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },
  { nome_materia: "Sustentabilidade e Meio Ambiente", curso: "Administração", ano_curricular: 3, area_conhecimento: "Tecnologias Técnicas" },

  // NÚCLEO COMUM OBRIGATÓRIO (aplicado em todos os cursos)
  { nome_materia: "Matemática", curso: "Geral", ano_curricular: 1, area_conhecimento: "Matemática e suas Tecnologias" },
  { nome_materia: "Matemática", curso: "Geral", ano_curricular: 2, area_conhecimento: "Matemática e suas Tecnologias" },
  { nome_materia: "Matemática", curso: "Geral", ano_curricular: 3, area_conhecimento: "Matemática e suas Tecnologias" },
  { nome_materia: "Língua Portuguesa", curso: "Geral", ano_curricular: 1, area_conhecimento: "Linguagens e Códigos" },
  { nome_materia: "Língua Portuguesa", curso: "Geral", ano_curricular: 2, area_conhecimento: "Linguagens e Códigos" },
  { nome_materia: "Língua Portuguesa", curso: "Geral", ano_curricular: 3, area_conhecimento: "Linguagens e Códigos" },
  { nome_materia: "Física", curso: "Geral", ano_curricular: 2, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "Física", curso: "Geral", ano_curricular: 3, area_conhecimento: "Ciências da Natureza" },
  { nome_materia: "História", curso: "Geral", ano_curricular: 1, area_conhecimento: "Ciências Humanas" },
  { nome_materia: "História", curso: "Geral", ano_curricular: 2, area_conhecimento: "Ciências Humanas" },
  { nome_materia: "História", curso: "Geral", ano_curricular: 3, area_conhecimento: "Ciências Humanas" },
];

export default materiasDoIF;
