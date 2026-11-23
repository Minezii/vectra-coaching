import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Barbell,
  CheckCircle,
  Clock,
  FilmStrip,
  Play,
  Trash,
  UploadSimple,
  VideoCamera,
} from '@phosphor-icons/react';
import { EXERCISE_ATLAS, ExerciseVideo } from '../data/exerciseAtlasData';
import { MuscleAnatomyViewer } from '../components/MuscleAnatomyViewer';

export function AtlasPage() {
  const [groupId, setGroupId] = useState<string>(EXERCISE_ATLAS[0].id);
  const [subGroupId, setSubGroupId] = useState<string>(
    EXERCISE_ATLAS[0].subGroups[0].id
  );
  const [exerciseId, setExerciseId] = useState<string>(
    EXERCISE_ATLAS[0].subGroups[0].exercises[0].id
  );

  // Local coach video preview URLs keyed by exercise id
  const [localVideos, setLocalVideos] = useState<
    Record<string, { url: string; fileName: string }>
  >({});
  const objectUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const currentGroup =
    EXERCISE_ATLAS.find((g) => g.id === groupId) ?? EXERCISE_ATLAS[0];
  const currentSubGroup =
    currentGroup.subGroups.find((s) => s.id === subGroupId) ??
    currentGroup.subGroups[0];
  const currentExercise: ExerciseVideo =
    currentSubGroup.exercises.find((ex) => ex.id === exerciseId) ??
    currentSubGroup.exercises[0];

  const handleSelectGroup = (nextGroupId: string) => {
    const nextGroup = EXERCISE_ATLAS.find((g) => g.id === nextGroupId);
    if (!nextGroup) return;
    const firstSub = nextGroup.subGroups[0];
    setGroupId(nextGroup.id);
    setSubGroupId(firstSub.id);
    setExerciseId(firstSub.exercises[0].id);
  };

  const handleSelectSubGroup = (nextSubId: string) => {
    const nextSub = currentGroup.subGroups.find((s) => s.id === nextSubId);
    if (!nextSub) return;
    setSubGroupId(nextSub.id);
    setExerciseId(nextSub.exercises[0].id);
  };

  const handleSelectFromBody = (nextGroupId: string, nextSubGroupId: string) => {
    const nextGroup = EXERCISE_ATLAS.find((g) => g.id === nextGroupId);
    const nextSub = nextGroup?.subGroups.find((s) => s.id === nextSubGroupId);
    if (!nextGroup || !nextSub) return;
    setGroupId(nextGroup.id);
    setSubGroupId(nextSub.id);
    setExerciseId(nextSub.exercises[0].id);
  };

  const handleUploadLocalVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const prevEntry = localVideos[currentExercise.id];
    if (prevEntry) {
      URL.revokeObjectURL(prevEntry.url);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objectUrl);

    setLocalVideos((prev) => ({
      ...prev,
      [currentExercise.id]: { url: objectUrl, fileName: file.name },
    }));

    e.target.value = '';
  };

  const handleRemoveLocalVideo = (targetId: string) => {
    const entry = localVideos[targetId];
    if (entry) {
      URL.revokeObjectURL(entry.url);
    }
    setLocalVideos((prev) => {
      const copy = { ...prev };
      delete copy[targetId];
      return copy;
    });
  };

  const activeLocalVideo = localVideos[currentExercise.id];
  const activeVideoSrc = activeLocalVideo?.url ?? currentExercise.videoUrl;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#05080E] bg-blueprint-grid">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-white/[0.08] bg-[#0A1120]/70">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 text-xs">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              <ArrowLeft size={14} weight="regular" aria-hidden="true" />
              <span>Обзор</span>
            </Link>
            <span className="text-[#475569]" aria-hidden="true">
              /
            </span>
            <span className="font-mono font-semibold uppercase tracking-wider text-[#F1F5F9]">
              Атлас упражнений
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-md border border-[#3B82F6]/30 bg-[#111C30]/80 px-2.5 py-1 font-mono text-[11px] text-[#93C5FD]">
            <VideoCamera size={14} weight="regular" aria-hidden="true" />
            <span>
              {currentGroup.label} → {currentSubGroup.label} → {currentSubGroup.exercises.length} видео
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#3B82F6]">
                <FilmStrip size={15} weight="regular" aria-hidden="true" />
                <span>3D-карта мышц и видеобиблиотека тренера</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
                Интерактивный атлас упражнений
              </h1>
              <p className="mt-3 text-base leading-relaxed text-[#94A3B8]">
                Выберите группу мышц или кликните прямо по зоне на модели человека — камера
                развернётся, выделит целевую мышцу красным и откроет ваши видеоразборы.
              </p>
            </div>

            <Link
              to="/apply"
              className="inline-flex items-center gap-2 self-start rounded-lg border border-white/12 bg-[#0A1120] px-4 py-2.5 text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#3B82F6] hover:text-white lg:self-auto"
            >
              <span>Подобрать программу под слабые зоны</span>
              <ArrowRight size={14} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
            </Link>
          </div>

          {/* LEVEL 1: Muscle Groups Tabs */}
          <div className="mt-8">
            <div className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
              1. Группа мышц
            </div>
            <div
              role="tablist"
              aria-label="Группы мышц"
              className="inline-flex max-w-full flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#0A1120] p-1.5"
            >
              {EXERCISE_ATLAS.map((group) => {
                const isSelected = group.id === currentGroup.id;
                return (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectGroup(group.id)}
                    className={`relative rounded-lg px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                      isSelected
                        ? 'text-white'
                        : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="atlas-group-pill"
                        transition={{ type: 'spring', stiffness: 290, damping: 28 }}
                        className="absolute inset-0 rounded-lg border border-[#3B82F6]/45 bg-[#182742] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                      />
                    )}
                    <span className="relative z-10">{group.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEVEL 2: Anatomical Sub-Group Tabs */}
          <div className="mt-5">
            <div className="mb-2.5 font-mono text-[11px] uppercase tracking-wider text-[#94A3B8]">
              2. Детализация: {currentGroup.label}
            </div>
            <div
              role="tablist"
              aria-label={`Части зоны ${currentGroup.label}`}
              className="flex flex-wrap gap-2 rounded-xl border border-white/[0.08] bg-[#0A1120]/70 p-2"
            >
              {currentGroup.subGroups.map((sub) => {
                const isSelected = sub.id === currentSubGroup.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleSelectSubGroup(sub.id)}
                    className={`relative inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                      isSelected
                        ? 'text-white'
                        : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="atlas-subgroup-pill"
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="absolute inset-0 rounded-lg border border-[#3B82F6]/40 bg-[#111C30]"
                      />
                    )}
                    <span className="relative z-10">{sub.label}</span>
                    <span
                      className={`relative z-10 rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                        isSelected
                          ? 'bg-[#1D4ED8]/60 text-[#DBEAFE]'
                          : 'bg-[#05080E] text-[#64748B]'
                      }`}
                    >
                      {sub.exercises.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LEVEL 3: Interactive Muscle Anatomy Viewer (5 cols) + Coach Video & Playlist (7 cols) */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            {/* Left 5 Cols: Interactive Human Anatomy Camera Viewer */}
            <div className="lg:sticky lg:top-20 lg:col-span-5">
              <MuscleAnatomyViewer
                activeGroupId={currentGroup.id}
                activeSubGroupId={currentSubGroup.id}
                activeLabel={currentSubGroup.label}
                onSelectMuscle={handleSelectFromBody}
              />
            </div>

            {/* Right 7 Cols: Video Stage + Exercise Playlist */}
            <div className="min-w-0 space-y-6 lg:col-span-7">
              {/* Video Player Stage */}
              <div className="rounded-2xl border border-white/10 bg-[#0A1120] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentExercise.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Video Frame (16:9 on sm+, fixed min-height full-width on mobile) */}
                    <div className="relative flex min-h-[225px] w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#05080E] sm:block sm:aspect-video sm:min-h-0">
                      {activeVideoSrc ? (
                        <video
                          key={activeVideoSrc}
                          src={activeVideoSrc}
                          poster={currentExercise.poster}
                          controls
                          playsInline
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <>
                          <img
                            src={currentExercise.poster}
                            alt={currentExercise.title}
                            className="absolute inset-0 h-full w-full object-cover opacity-55"
                          />
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#05080E]/55 to-[#05080E]/30"
                            aria-hidden="true"
                          />

                          <div className="relative z-10 flex h-full flex-col justify-between p-3.5 sm:p-4">
                            {/* Top Bar Inside Video Stage */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-white/15 bg-[#05080E]/85 px-2.5 py-1 font-mono text-[10px] text-[#93C5FD] backdrop-blur-sm sm:text-[11px]">
                                <VideoCamera size={13} weight="regular" className="shrink-0" aria-hidden="true" />
                                <span className="truncate">ВИДЕО • {currentSubGroup.label.toUpperCase()}</span>
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 bg-[#05080E]/85 px-2 py-1 font-mono text-[10px] text-[#E2E8F0] tabular-nums backdrop-blur-sm sm:text-[11px]">
                                <Clock size={12} weight="regular" aria-hidden="true" />
                                <span>{currentExercise.duration}</span>
                              </span>
                            </div>

                            {/* Center Play / Local Test Upload Trigger */}
                            <div className="my-auto flex flex-col items-center justify-center px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#3B82F6]/60 bg-[#111C30]/90 text-white shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-md transition-transform hover:scale-105 hover:border-[#3B82F6] hover:bg-[#182742] sm:h-14 sm:w-14"
                                aria-label={`Загрузить видео для упражнения ${currentExercise.title}`}
                              >
                                <Play size={20} weight="fill" className="ml-0.5 text-[#3B82F6]" aria-hidden="true" />
                              </button>

                              <div className="mt-3 max-w-md">
                                <div className="text-xs font-semibold text-[#F1F5F9] sm:text-sm">
                                  Слот для вашего видео разбора
                                </div>
                                <p className="mt-1 text-[11px] text-[#94A3B8] sm:text-xs">
                                  Загрузите клип MP4/MOV для предпросмотра или укажите путь в{' '}
                                  <code className="font-mono text-[#93C5FD]">videoUrl</code>
                                </p>
                              </div>
                            </div>

                            <div className="h-1" aria-hidden="true" />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hidden File Input + Upload / Clear Controls */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm,video/*"
                      onChange={handleUploadLocalVideo}
                      className="hidden"
                    />

                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-[#05080E]/80 px-3.5 py-2.5">
                      <div className="text-xs text-[#94A3B8]">
                        {activeLocalVideo ? (
                          <span className="font-mono text-[#93C5FD]">
                            Предпросмотр: {activeLocalVideo.fileName}
                          </span>
                        ) : (
                          <span>
                            Загрузите свой видеоролик для проверки в плеере.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#3B82F6]/40 bg-[#111C30] px-3 py-1.5 text-xs font-semibold text-[#E2E8F0] transition-colors hover:border-[#3B82F6] hover:text-white"
                        >
                          <UploadSimple size={14} weight="regular" className="text-[#3B82F6]" aria-hidden="true" />
                          <span>{activeLocalVideo ? 'Заменить видео' : 'Загрузить MP4 / MOV'}</span>
                        </button>

                        {activeLocalVideo && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLocalVideo(currentExercise.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-[#0A1120] px-2.5 py-1.5 text-xs text-[#94A3B8] transition-colors hover:border-rose-500/40 hover:text-rose-300"
                            aria-label="Удалить загруженный предпросмотр"
                          >
                            <Trash size={14} weight="regular" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title & Technical Specs */}
                    <div className="mt-6">
                      <h2 className="text-xl font-bold tracking-tight text-[#F1F5F9] sm:text-2xl">
                        {currentExercise.title}
                      </h2>
                      <p className="mt-1.5 text-sm text-[#94A3B8]">
                        Целевой фокус:{' '}
                        <span className="text-[#E2E8F0]">{currentExercise.targetFocus}</span>
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        <div className="rounded-lg border border-white/[0.08] bg-[#05080E]/85 p-3">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                            Рабочий объём
                          </div>
                          <div className="mt-1 font-mono text-xs font-semibold text-[#F1F5F9] tabular-nums sm:text-sm">
                            {currentExercise.setsReps}
                          </div>
                        </div>
                        <div className="rounded-lg border border-white/[0.08] bg-[#05080E]/85 p-3">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                            Темп (Э-П-К-П)
                          </div>
                          <div className="mt-1 font-mono text-xs font-semibold text-[#93C5FD] tabular-nums sm:text-sm">
                            {currentExercise.tempo}
                          </div>
                        </div>
                        <div className="rounded-lg border border-white/[0.08] bg-[#05080E]/85 p-3">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                            Оборудование
                          </div>
                          <div className="mt-1 text-xs font-semibold text-[#F1F5F9] sm:text-sm">
                            {currentExercise.equipment}
                          </div>
                        </div>
                      </div>

                      {/* Technical Cues */}
                      <div className="mt-6 border-t border-white/10 pt-5">
                        <div className="font-mono text-xs uppercase tracking-wider text-[#3B82F6]">
                          Технические акценты тренера
                        </div>
                        <ul className="mt-3 space-y-2.5">
                          {currentExercise.cues.map((cue) => (
                            <li key={cue} className="flex items-start gap-2.5 text-sm text-[#CBD5E1]">
                              <CheckCircle
                                size={17}
                                weight="regular"
                                className="mt-0.5 shrink-0 text-[#3B82F6]"
                                aria-hidden="true"
                              />
                              <span>{cue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Sub-Group Exercise Video Playlist */}
              <div className="rounded-2xl border border-white/10 bg-[#0A1120] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#3B82F6]">
                      <Barbell size={16} weight="regular" aria-hidden="true" />
                      <span>Видео для зоны: {currentSubGroup.label}</span>
                    </div>
                    <span className="font-mono text-xs text-[#94A3B8] tabular-nums">
                      {currentSubGroup.exercises.length} упр.
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                    {currentSubGroup.anatomyNote}
                  </p>
                </div>

                <div
                  className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
                  role="listbox"
                  aria-label={`Упражнения для зоны ${currentSubGroup.label}`}
                >
                  {currentSubGroup.exercises.map((ex, idx) => {
                    const isActive = ex.id === currentExercise.id;
                    const hasCustomVideo = Boolean(localVideos[ex.id] || ex.videoUrl);
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => setExerciseId(ex.id)}
                        className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                          isActive
                            ? 'border-[#3B82F6] bg-[#111C30] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                            : 'border-white/[0.08] bg-[#05080E]/80 hover:border-white/20 hover:bg-[#111C30]/60'
                        }`}
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#05080E]">
                          <img
                            src={ex.poster}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover opacity-75"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-[#05080E]/35">
                            <Play
                              size={15}
                              weight="fill"
                              className={isActive ? 'text-[#3B82F6]' : 'text-white/90'}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="absolute right-1 bottom-1 rounded bg-[#05080E]/90 px-1 py-0.5 font-mono text-[10px] text-[#E2E8F0] tabular-nums">
                            {ex.duration}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-[#94A3B8] tabular-nums">
                              0{idx + 1} • {ex.equipment}
                            </span>
                            {hasCustomVideo && (
                              <span className="rounded border border-emerald-500/35 bg-emerald-950/40 px-1.5 py-0.5 font-mono text-[9px] text-emerald-300">
                                OK
                              </span>
                            )}
                          </div>
                          <div
                            className={`mt-1 text-xs font-bold leading-snug sm:text-sm ${
                              isActive ? 'text-white' : 'text-[#E2E8F0] group-hover:text-white'
                            }`}
                          >
                            {ex.title}
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-[#93C5FD] tabular-nums">
                            {ex.setsReps}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA Strip */}
          <div className="mt-10 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#0A1120] px-6 py-5 sm:flex-row sm:items-center">
            <div className="max-w-2xl text-sm text-[#CBD5E1]">
              Хотите, чтобы я разобрал вашу технику по видео, убрал лишние движения и собрал
              персональный сплит под отстающие мышечные группы?
            </div>
            <Link
              to="/apply"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] active:scale-[0.98]"
            >
              <span>Подать заявку на ведение</span>
              <ArrowRight size={16} weight="regular" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
