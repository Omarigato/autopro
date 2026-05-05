"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit2, Trash2, KeyRound, UserPlus, CheckCircle, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import InputMask from "react-input-mask";
import { useTranslation } from "@/hooks/useTranslation";


const ROLES = [
  { value: "client", label: "Клиент" },
  { value: "admin", label: "Администратор" },
];

type UserRow = {
  id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  create_date?: string | null;
};

const emptyForm = {
  name: "",
  email: "",
  phone_number: "",
  role: "client",
  password: "",
  is_active: true,
};

const PHONE_MASK = "+7 (999) 999-99-99";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(value: string): boolean {
  if (!value?.trim()) return false;
  const normalized = value.replace(/\D/g, "");
  return normalized.length === 11 && normalized.startsWith("7") && /^7\d{10}$/.test(normalized);
}

function isValidEmail(value: string): boolean {
  if (!value?.trim()) return false;
  return EMAIL_REGEX.test(value.trim());
}

/** Приводит номер к виду +7 (999) 999-99-99 для отображения в маске */
function formatPhoneForMask(phone: string | null | undefined): string {
  if (!phone?.trim()) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }
  return phone;
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [resetPwdLoading, setResetPwdLoading] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    apiClient
      .get("/admin/users")
      .then((res: any) => {
        const d = res?.data ?? res;
        setUsers(Array.isArray(d) ? d : []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    if (!confirm(currentStatus ? t("admin.users_page.confirm_block") : t("admin.users_page.confirm_unblock"))) return;
    try {
      await apiClient.patch(`/admin/users/${id}`, { is_active: !currentStatus });
      toast.success(t("admin.users_page.status_changed"));
      loadUsers();
    } catch {
      toast.error(t("admin.users_page.status_error"));
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setForm({
      name: u.name ?? "",
      email: u.email ?? "",
      phone_number: formatPhoneForMask(u.phone_number),
      role: u.role,
      password: "",
      is_active: u.is_active,
    });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    const emailTrim = form.email?.trim() ?? "";
    const phoneTrim = form.phone_number?.trim() ?? "";

    if (!emailTrim && !phoneTrim) {
      toast.error(t("admin.users_page.email_or_phone_required"));
      return;
    }
    if (emailTrim && !isValidEmail(emailTrim)) {
      toast.error(t("admin.users_page.correct_email_required"));
      return;
    }
    if (phoneTrim && !isValidPhone(phoneTrim)) {
      toast.error(t("admin.users_page.phone_format_required"));
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/admin/users", {
        name: form.name || undefined,
        email: form.email || undefined,
        phone_number: form.phone_number || undefined,
        role: form.role,
        password: form.password || undefined,
        is_active: form.is_active,
      });
      toast.success(t("admin.users_page.user_added"));
      setAddOpen(false);
      loadUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? t("admin.users_page.add_error");
      toast.error(typeof msg === "string" ? msg : t("admin.users_page.add_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editUser) return;

    const emailTrim = form.email?.trim() ?? "";
    const phoneTrim = form.phone_number?.trim() ?? "";

    if (emailTrim && !isValidEmail(emailTrim)) {
      toast.error(t("admin.users_page.correct_email_required"));
      return;
    }
    if (phoneTrim && !isValidPhone(phoneTrim)) {
      toast.error(t("admin.users_page.phone_format_required"));
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.patch(`/admin/users/${editUser.id}`, {
        name: form.name || null,
        email: form.email || null,
        phone_number: form.phone_number || null,
        role: form.role,
        is_active: form.is_active,
      });
      toast.success(t("admin.users_page.saved"));
      setEditOpen(false);
      setEditUser(null);
      loadUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? t("admin.users_page.save_error");
      toast.error(typeof msg === "string" ? msg : t("admin.users_page.save_error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (id: number, email: string | null) => {
    if (!email) {
      toast.error(t("admin.users_page.no_email_reset"));
      return;
    }
    if (!confirm(t("admin.users_page.confirm_reset"))) return;
    setResetPwdLoading(id);
    try {
      const res: any = await apiClient.post(`/admin/users/${id}/reset-password`);
      const d = res?.data ?? res;
      if (d?.sent) {
        toast.success(t("admin.users_page.reset_success"));
      } else {
        toast.warning(t("admin.users_page.reset_warning"));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? t("admin.users_page.reset_error");
      toast.error(typeof msg === "string" ? msg : t("admin.users_page.reset_error"));
    } finally {
      setResetPwdLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("admin.users_page.confirm_delete"))) return;
    try {
      await apiClient.delete(`/admin/users/${id}`);
      toast.success(t("admin.users_page.deleted"));
      loadUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.message ?? t("admin.users_page.delete_error");
      toast.error(typeof msg === "string" ? msg : t("admin.users_page.delete_error"));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone_number || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div className="text-slate-500">{t("admin.loading")}</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t("admin.users_page.title")}
          </h2>
          <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">
            {t("admin.users_page.subtitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 min-w-0">
          <div className="relative min-w-0">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder={t("admin.users_page.search")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 sm:pl-11 pr-4 h-11 w-full sm:w-72 bg-white border-slate-200 rounded-xl sm:rounded-2xl shadow-sm focus-visible:ring-slate-400 font-medium text-base"
            />
          </div>
          <Button
            className="h-11 px-5 sm:px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl sm:rounded-2xl font-black shadow-lg shadow-slate-200 gap-2 text-sm sm:text-base"
            onClick={openAdd}
          >
            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            {t("admin.users_page.add")}
          </Button>
        </div>
      </div>

      {/* Мобильная версия: карточки */}
      <div className="md:hidden space-y-3">
        {paginatedUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 font-medium">
            {t("admin.users_page.no_users")}
          </div>
        ) : (
          paginatedUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg font-bold text-slate-900 truncate">{u.name || "—"}</span>
                <span className="text-xs font-bold text-slate-400 shrink-0">#{u.id}</span>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">Email</span>
                  <span className="text-slate-900 font-medium truncate text-right">{u.email || "—"}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">{t("admin.users_page.phone")}</span>
                  <span className="text-slate-900 font-medium text-right break-all">{u.phone_number || "—"}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">{t("admin.users_page.role")}</span>
                  <span className="text-slate-900 font-medium">{u.role === "admin" ? t("admin.users_page.role_admin") : t("admin.users_page.role_client")}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 shrink-0">{t("admin.users_page.active")}</span>
                  <span className={u.is_active ? "text-blue-600 font-medium" : "text-red-400"}>
                    {u.is_active ? t("admin.users_page.yes") : t("admin.users_page.no")}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 font-medium"
                  onClick={() => openEdit(u)}
                >
                  <Edit2 className="w-4 h-4" />
                  {t("admin.users_page.edit")}
                </Button>
                {u.email && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2 font-medium"
                    disabled={resetPwdLoading === u.id}
                    onClick={() => handleResetPassword(u.id, u.email)}
                  >
                    <KeyRound className="w-4 h-4" />
                    {t("admin.users_page.reset_password")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 font-medium"
                  onClick={() => handleToggleActive(u.id, u.is_active)}
                >
                  {u.is_active ? (
                    <Lock className="w-4 h-4 text-red-500" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 font-medium text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(u.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  {t("admin.users_page.delete")}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Десктоп: таблица */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.users_page.id")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.users_page.name")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.users_page.email")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.users_page.phone")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.users_page.role")}</th>
                <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.users_page.active")}</th>
                <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("admin.users_page.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-600 font-medium">{u.id}</td>
                  <td className="p-4 font-medium text-slate-900">{u.name || "—"}</td>
                  <td className="p-4 text-slate-700">{u.email || "—"}</td>
                  <td className="p-4 text-slate-700">{u.phone_number || "—"}</td>
                  <td className="p-4 text-slate-700">{u.role === "admin" ? t("admin.users_page.role_admin") : t("admin.users_page.role_client")}</td>
                  <td className="p-4">
                    {u.is_active ? (
                      <span className="text-blue-600 font-medium">{t("admin.users_page.yes")}</span>
                    ) : (
                      <span className="text-red-400">{t("admin.users_page.no")}</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl hover:bg-slate-100"
                        onClick={() => openEdit(u)}
                        title="Редактировать"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {u.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl hover:bg-slate-100"
                          disabled={resetPwdLoading === u.id}
                          onClick={() => handleResetPassword(u.id, u.email)}
                          title="Сбросить пароль (отправить на email)"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        title={u.is_active ? "Заблокировать" : "Разблокировать"}
                      >
                        {u.is_active ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(u.id)}
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium">{t("admin.users_page.no_users")}</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            {t("common.back")}
          </Button>
          <span className="text-sm font-medium text-slate-500">
            {t("admin.users_page.page")} {currentPage} {t("admin.users_page.of")} {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            {t("common.next")}
          </Button>
        </div>
      )}

      {/* Диалог добавления пользователя */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.users_page.new_user")}</DialogTitle>
            <DialogDescription>{t("admin.users_page.new_user_desc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">{t("admin.users_page.name")}</Label>
              <Input
                id="add-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Иван Иванов"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-email">{t("admin.users_page.email")}</Label>
              <Input
                id="add-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@example.com"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-phone">{t("admin.users_page.phone")}</Label>
              <InputMask
                mask={PHONE_MASK}
                value={form.phone_number}
                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              >
                {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                  <Input
                    {...inputProps}
                    id="add-phone"
                    placeholder="+7 (777) 000-00-00"
                    type="tel"
                    className="rounded-xl"
                  />
                )}
              </InputMask>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.users_page.role")}</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.value === "admin" ? t("admin.users_page.role_admin") : t("admin.users_page.role_client")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-password">{t("admin.users_page.password")}</Label>
              <Input
                id="add-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={t("admin.users_page.save_password_desc")}
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="add-active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <Label htmlFor="add-active" className="font-normal cursor-pointer">{t("admin.users_page.active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAdd} disabled={submitting} className="rounded-xl">
              {submitting ? t("common.saving") : t("admin.users_page.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования пользователя */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditUser(null); setEditOpen(open); }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.users_page.edit_user")}</DialogTitle>
            <DialogDescription>{t("admin.users_page.edit_user_desc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("admin.users_page.name")}</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Иван Иванов"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">{t("admin.users_page.email")}</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@example.com"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">{t("admin.users_page.phone")}</Label>
              <InputMask
                mask={PHONE_MASK}
                value={form.phone_number}
                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
              >
                {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                  <Input
                    {...inputProps}
                    id="edit-phone"
                    placeholder="+7 (777) 000-00-00"
                    type="tel"
                    className="rounded-xl"
                  />
                )}
              </InputMask>
            </div>
            <div className="grid gap-2">
              <Label>{t("admin.users_page.role")}</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.value === "admin" ? t("admin.users_page.role_admin") : t("admin.users_page.role_client")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <Label htmlFor="edit-active" className="font-normal cursor-pointer">{t("admin.users_page.active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={submitting} className="rounded-xl">
              {submitting ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
