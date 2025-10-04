import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Search, CreditCard as Edit, Trash2, Clock, X, Users } from 'lucide-react';
import Select from 'react-select'; // Biblioteca para seleção múltipla

// Serviços da API
import TurmaService from '../../core/api/turmaService';
import UserService from '../../core/api/userService';
import SportService from '../../core/api/sportService';
import CategoryService from '../../core/api/categoryService';

// Tipos (CORREÇÃO: Adicionado 'Student')
import { Class, User, Sport, Category, ClassSchedule, Student } from '../../types';
import { CreateTurmaRequest } from '../../core/api/types';

// Componentes de UI
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Dropdown from '../../components/ui/Dropdown';
import ClassDetailsModal from './classDetailsModal';


// Sub-componente para selecionar Alunos
const StudentSelector = ({ 
    allStudents, 
    selectedStudentIds, 
    setSelectedStudentIds 
}: { 
    allStudents: Student[], 
    selectedStudentIds: string[], 
    setSelectedStudentIds: (ids: string[]) => void 
}) => {
    
    const studentOptions = allStudents.map(s => ({ value: s.id, label: s.name }));
    const selectedOptions = studentOptions.filter(opt => selectedStudentIds.includes(opt.value));

    return (
        <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" /> Alunos Matriculados
            </h3>
            <Select
                isMulti
                options={studentOptions}
                value={selectedOptions}
                onChange={(options) => setSelectedStudentIds(options.map(opt => opt.value))}
                placeholder="Selecione os alunos para esta turma..."
                noOptionsMessage={() => "Nenhum aluno encontrado"}
                styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
            />
        </div>
    );
};


// Sub-componente para gerenciar os horários (sem alterações)
const ScheduleManager = ({ schedules, setSchedules }: { schedules: ClassSchedule[], setSchedules: (schedules: ClassSchedule[]) => void }) => {
  const [day, setDay] = useState<string>("1");
  const [time, setTime] = useState<string>("08:00");

  const weekDays = [
    { value: "1", label: "Segunda-feira" }, { value: "2", label: "Terça-feira" },
    { value: "3", label: "Quarta-feira" }, { value: "4", label: "Quinta-feira" },
    { value: "5", label: "Sexta-feira" }, { value: "6", label: "Sábado" },
    { value: "0", label: "Domingo" },
  ];

  const handleAddSchedule = () => {
    if (!time) { toast.error("Por favor, informe um horário."); return; }
    const newSchedule: ClassSchedule = { dayOfWeek: parseInt(day, 10), time };
    if (schedules.some(s => s.dayOfWeek === newSchedule.dayOfWeek && s.time === newSchedule.time)) {
        toast.error("Este horário já foi adicionado."); return;
    }
    setSchedules([...schedules, newSchedule].sort((a, b) => a.dayOfWeek - b.dayOfWeek));
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Horários das Aulas</h3>
        <div className="flex items-end gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                <select value={day} onChange={e => setDay(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                    {weekDays.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
            </div>
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário (HH:MM)</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <Button type="button" variant="secondary" onClick={handleAddSchedule}>Adicionar</Button>
        </div>
        <div className="space-y-2">
            {schedules.length > 0 ? schedules.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-700" />
                        <span className="font-medium text-blue-800">
                            {weekDays.find(d => d.value === String(schedule.dayOfWeek))?.label} às {schedule.time}
                        </span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSchedule(index)}>
                        <X className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
            )) : <p className="text-center text-gray-500 py-4">Nenhum horário adicionado.</p>}
        </div>
    </div>
  );
};


export default function ClassesManagement() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [professors, setProfessors] = useState<User[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Partial<Class> | null>(null);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [classesData, usersData, sportsData, categoriesData, studentsData] = await Promise.all([
                TurmaService.getTurmas(),
                UserService.getAllUsers(),
                SportService.getSports(),
                CategoryService.getCategories(),
                UserService.getStudents(),
            ]);
            setClasses(classesData);
            setProfessors(usersData.filter((p: User) => p.role === 'professor'));
            setSports(sportsData);
            setCategories(categoriesData);
            setStudents(studentsData);
        } catch (err) {
            toast.error('Falha ao carregar dados. Tente atualizar a página.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenFormModal = (classItem: Partial<Class> | null = null) => {
        setEditingClass(classItem || { schedule: [], students: [] });
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingClass(null);
    };

    const handleSaveClass = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingClass) return;

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as { [key: string]: string };
        
        const classPayload: CreateTurmaRequest = {
            nome: data.name,
            esporte_id: data.sportId,
            categoria: data.categoryId,
            professor_id: data.professorId,
            alunos_ids: editingClass.students || [],
            horarios: (editingClass.schedule || []).map(s => ({
                dia_semana: ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][s.dayOfWeek],
                hora_inicio: s.time,
                hora_fim: s.time,
            })),
        };

        try {
            if (editingClass.id) {
                await TurmaService.updateTurma(editingClass.id, classPayload);
                toast.success('Turma atualizada com sucesso!');
            } else {
                await TurmaService.createTurma(classPayload);
                toast.success('Turma criada com sucesso!');
            }
            handleCloseFormModal();
            await loadData();
        } catch (err) {
            toast.error('Erro ao salvar turma.');
            console.error(err);
        }
    };

    const handleDeleteClass = async (classId: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta turma?')) {
            try {
                await TurmaService.deleteTurma(classId);
                toast.success('Turma excluída com sucesso!');
                await loadData();
            } catch (err) {
                toast.error('Erro ao excluir turma.');
                console.error(err);
            }
        }
    };

    const getEntityNameById = (id: string, list: { id: string; name: string }[]) => {
        return list.find(item => item.id === id)?.name || 'N/A';
    };

    const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (isLoading) return <div className="p-6 text-center">Carregando...</div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div><h1 className="text-2xl font-bold text-gray-900">Gerenciar Turmas</h1><p className="text-gray-600 mt-1">Organize e gerencie todas as turmas do sistema</p></div>
                <Button onClick={() => handleOpenFormModal()}><Plus className="w-4 h-4 mr-2" /> Nova Turma</Button>
            </div>

            <div className="bg-white rounded-lg shadow-md mb-6 p-6">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Buscar turmas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" /></div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Esporte</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Professor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alunos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredClasses.map((classItem) => (
                                <tr key={classItem.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedClass(classItem)}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{classItem.name}</td>
                                    <td className="px-6 py-4 text-gray-700">{classItem.sportName}</td>
                                    <td className="px-6 py-4 text-gray-700">{classItem.categoryId}</td>
                                    <td className="px-6 py-4 text-gray-700">{getEntityNameById(classItem.professorId, professors)}</td>
                                    <td className="px-6 py-4 text-gray-700">{classItem.students.length} / {classItem.maxStudents}</td>
                                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        <Dropdown items={[{ label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => handleOpenFormModal(classItem) }, { label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDeleteClass(classItem.id), variant: 'danger' }]} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedClass && (
                <ClassDetailsModal classItem={selectedClass} isOpen={!!selectedClass} onClose={() => setSelectedClass(null)} professors={professors} sports={sports} />
            )}

            {isFormModalOpen && editingClass && (
                <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingClass.id ? 'Editar Turma' : 'Nova Turma'} size="xl">
                    <form className="space-y-6" onSubmit={handleSaveClass}>
                        {/* Campos Principais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma</label><input name="name" defaultValue={editingClass.name} required className="w-full px-4 py-2 border rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Professor</label><select name="professorId" defaultValue={editingClass.professorId} required className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione</option>{professors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Esporte</label><select name="sportId" defaultValue={editingClass.sportId} required className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione</option>{sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label><select name="categoryId" defaultValue={editingClass.categoryId} required className="w-full px-4 py-2 border rounded-lg"><option value="">Selecione</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.sportName})</option>)}</select></div>
                        </div>
                        
                        {/* Gerenciador de Alunos */}
                        <StudentSelector 
                            allStudents={students}
                            selectedStudentIds={editingClass.students || []}
                            setSelectedStudentIds={(ids) => setEditingClass(prev => ({...prev, students: ids}))}
                        />

                        {/* Gerenciador de Horários */}
                        <ScheduleManager 
                            schedules={editingClass.schedule || []}
                            setSchedules={(newSchedules) => setEditingClass(prev => ({...prev, schedule: newSchedules}))}
                        />

                        {/* Botões de Ação */}
                        <div className="flex justify-end space-x-4 pt-6 border-t"><Button type="button" variant="secondary" onClick={handleCloseFormModal}>Cancelar</Button><Button type="submit">Salvar</Button></div>
                    </form>
                </Modal>
            )}
        </div>
    );
}