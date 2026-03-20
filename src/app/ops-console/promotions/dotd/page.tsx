"use client";
/**
 * Deal of the Day — Slot Calendar Management
 * Calendar view of DOTD slots with assign, override, and remove capabilities.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Calendar, ArrowLeft, RefreshCw, Plus, Zap, ChevronLeft,
  ChevronRight, Trash2, AlertTriangle, Shield, Eye,
  CheckCircle, Clock, XCircle, Edit2,
} from "lucide-react";
import {
  adminGetDOTDSlots,
  adminOverrideDOTDSlot,
  adminRemoveDOTDSlot,
} from "@/app/actions/promotions";
import PromotionViewModal from "@/components/admin/PromotionViewModal";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */

type DOTDSlot = Awaited<ReturnType<typeof adminGetDOTDSlots>>[number];

/** Derive display status from slot data */
function slotStatus(slot: DOTDSlot): "active" | "scheduled" | "expired" | "pending" {
  const today = new Date().toISOString().slice(0, 10);
  if (slot.slotDate < today) return "expired";
  if (slot.slotDate === today && slot.isConfirmed) return "active";
  if (slot.isConfirmed) return "scheduled";
  return "pending";
}

/* ─── Helpers ───────────────────────────────────────────── */

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDow = firstDay.getDay(); // 0=Sun
  const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevLastDay = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevLastDay - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    days.push({ date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      isCurrentMonth: true,
    });
  }

  // Next month padding
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 2 > 12 ? 1 : month + 2;
    const y = month + 2 > 12 ? year + 1 : year;
    days.push({ date: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
  }

  return days;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Override Modal ────────────────────────────────────── */

function OverrideSlotModal({
  slotDate,
  existingSlot,
  onClose,
  onSuccess,
}: {
  slotDate: string;
  existingSlot?: DOTDSlot;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    dealId: existingSlot?.dealId?.toString() ?? "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.dealId) { toast.error("Deal ID is required"); return; }
    setSubmitting(true);
    try {
      await adminOverrideDOTDSlot({
        slotDate,
        dealId: parseInt(form.dealId),
        notes: form.notes || undefined,
      });
      toast.success(existingSlot ? "Slot overridden" : "Slot assigned");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to assign slot");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              {existingSlot ? "Override DOTD Slot" : "Assign DOTD Slot"}
            </h3>
            <p className="text-sm text-slate-600 mt-1">Date: <span className="font-semibold">{slotDate}</span></p>
          </div>
          <div className="p-6 space-y-4">
            {existingSlot && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4" />
                  This slot is already assigned
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Current: {existingSlot.dealTitle ?? `Deal #${existingSlot.dealId}`} — Status: {slotStatus(existingSlot)}
                </p>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Deal ID</label>
              <input
                type="number"
                value={form.dealId}
                onChange={e => setForm(f => ({ ...f, dealId: e.target.value }))}
                placeholder="Enter deal ID"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Admin Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="Reason for assignment..."
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400/30 resize-none"
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : existingSlot ? "Override" : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Remove Confirm Modal ──────────────────────────────── */

function RemoveSlotModal({
  slotDate,
  slot,
  onClose,
  onSuccess,
}: {
  slotDate: string;
  slot: DOTDSlot;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await adminRemoveDOTDSlot(slotDate);
      toast.success("DOTD slot removed");
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to remove slot");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Remove DOTD Slot?</h3>
          <p className="text-sm text-slate-500 mb-2">
            Date: <span className="font-semibold">{slotDate}</span>
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Deal: {slot.dealTitle ?? `#${slot.dealId}`}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancel</button>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            >
              {removing ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main ──────────────────────────────────────────────── */

export default function DOTDManagementPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [slots, setSlots] = useState<DOTDSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [overrideDate, setOverrideDate] = useState<string | null>(null);
  const [removeSlot, setRemoveSlot] = useState<{ date: string; slot: DOTDSlot } | null>(null);
  const [selectedPromoId, setSelectedPromoId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const data = await adminGetDOTDSlots({ startDate, endDate });
      setSlots(data);
    } catch {
      toast.error("Failed to load DOTD slots");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const slotMap = useMemo(() => {
    const map: Record<string, DOTDSlot> = {};
    slots.forEach(s => { map[s.slotDate] = s; });
    return map;
  }, [slots]);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const goToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  };

  // Stats
  const totalSlots = slots.length;
  const activeSlots = slots.filter(s => slotStatus(s) === "active").length;
  const bookedSlots = slots.filter(s => ["active", "scheduled"].includes(slotStatus(s))).length;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const openSlots = daysInMonth - bookedSlots;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ops-console/promotions" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              Deal of the Day
            </h1>
            <p className="text-sm text-slate-500">Manage DOTD slot calendar and reservations.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase">Total Slots</p>
          <p className="text-xl font-bold text-slate-900">{totalSlots}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase">Active Today</p>
          <p className="text-xl font-bold text-green-600">{activeSlots}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase">Booked</p>
          <p className="text-xl font-bold text-blue-600">{bookedSlots}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase">Open Slots</p>
          <p className="text-xl font-bold text-amber-600">{openSlots}</p>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 min-w-[200px] text-center">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            Today
          </button>
          <button onClick={load} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
          Loading calendar...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DOW_NAMES.map(d => (
              <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold text-slate-500 uppercase bg-slate-50">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const slot = slotMap[day.date];
              const isToday = day.date === today;
              const isPast = day.date < today;

              return (
                <div
                  key={i}
                  className={`min-h-[100px] border-b border-r border-slate-100 p-2 transition-colors ${
                    !day.isCurrentMonth ? "bg-slate-50/50" : "bg-white"
                  } ${isToday ? "ring-2 ring-inset ring-red-300" : ""} ${
                    day.isCurrentMonth && !isPast ? "hover:bg-slate-50 cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (!day.isCurrentMonth) return;
                    setSelectedDate(day.date);
                  }}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      !day.isCurrentMonth ? "text-slate-300" :
                      isToday ? "text-red-600 font-bold" : "text-slate-600"
                    }`}>
                      {day.day}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-600 rounded">TODAY</span>
                    )}
                  </div>

                  {/* Slot info */}
                  {slot && day.isCurrentMonth && (
                    <div className={`rounded-lg p-1.5 text-[11px] ${(() => {
                      const st = slotStatus(slot);
                      return st === "active" ? "bg-green-50 border border-green-200" :
                      st === "scheduled" ? "bg-blue-50 border border-blue-200" :
                      st === "expired" ? "bg-slate-50 border border-slate-200" :
                      "bg-yellow-50 border border-yellow-200";
                    })()}`}>
                      <p className="font-semibold text-slate-700 truncate">{slot.dealTitle ?? `Deal #${slot.dealId}`}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {slotStatus(slot) === "active" ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : slotStatus(slot) === "expired" ? (
                          <XCircle className="w-3 h-3 text-slate-400" />
                        ) : (
                          <Clock className="w-3 h-3 text-blue-500" />
                        )}
                        <span className="text-[10px] text-slate-500 capitalize">{slotStatus(slot)}</span>
                      </div>
                    </div>
                  )}

                  {/* Empty slot indicator for future dates */}
                  {!slot && day.isCurrentMonth && !isPast && (
                    <div className="rounded-lg border border-dashed border-slate-200 p-1.5 text-center">
                      <Plus className="w-3 h-3 text-slate-300 mx-auto" />
                      <p className="text-[10px] text-slate-300 mt-0.5">Open</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
          Active
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          Booked (Paid/Scheduled)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />
          Pending
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
          Expired
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-dashed border-slate-300" />
          Open
        </div>
      </div>

      {/* Selected Date Detail Panel */}
      {selectedDate && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[50]" onClick={() => setSelectedDate(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-[51] bg-white border-t border-slate-200 shadow-2xl rounded-t-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h3>
              <button onClick={() => setSelectedDate(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <XCircle className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {slotMap[selectedDate] ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {slotMap[selectedDate].dealTitle ?? `Deal #${slotMap[selectedDate].dealId}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">Status: {slotStatus(slotMap[selectedDate])}</p>
                      {slotMap[selectedDate].promotionId && (
                        <p className="text-xs text-slate-400 mt-0.5">Promotion #{slotMap[selectedDate].promotionId}</p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${
                      slotStatus(slotMap[selectedDate]) === "active" ? "bg-green-100" : "bg-blue-100"
                    }`}>
                      <Zap className={`w-5 h-5 ${
                        slotStatus(slotMap[selectedDate]) === "active" ? "text-green-600" : "text-blue-600"
                      }`} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {slotMap[selectedDate].promotionId && (
                    <button
                      onClick={() => { setSelectedDate(null); setSelectedPromoId(slotMap[selectedDate].promotionId!); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" /> View Promotion
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedDate(null); setOverrideDate(selectedDate); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" /> Override
                  </button>
                  <button
                    onClick={() => { setSelectedDate(null); setRemoveSlot({ date: selectedDate, slot: slotMap[selectedDate] }); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-6 border border-dashed border-slate-300 text-center">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No deal assigned for this date.</p>
                </div>
                <button
                  onClick={() => { setSelectedDate(null); setOverrideDate(selectedDate); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Assign Deal
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {overrideDate && (
        <OverrideSlotModal
          slotDate={overrideDate}
          existingSlot={slotMap[overrideDate]}
          onClose={() => setOverrideDate(null)}
          onSuccess={load}
        />
      )}
      {removeSlot && (
        <RemoveSlotModal
          slotDate={removeSlot.date}
          slot={removeSlot.slot}
          onClose={() => setRemoveSlot(null)}
          onSuccess={load}
        />
      )}
      {selectedPromoId && (
        <PromotionViewModal
          promotionId={selectedPromoId}
          onClose={() => setSelectedPromoId(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
}
