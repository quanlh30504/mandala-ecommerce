"use client";

import { useFormState } from "react-dom";
import type { IUser } from "@/models/User";
import { useRouter } from "next/navigation";
import { User, Calendar as CalendarIcon } from "lucide-react";
import SubmitButton from "@/components/Buttons/SubmitButton";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { updateProfile } from "@/lib/actions/user";
import { useState } from "react";
import { countries } from "@/lib/data";
import { cn } from "@/lib/utils"; // Tiện ích của shadcn
import { format } from "date-fns"; // Thư viện để định dạng ngày

// --- shadcn ui ---
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserInfoFormProps {
  user: IUser;
}

export default function UserInfoForm({ user }: UserInfoFormProps) {
  const router = useRouter();
  const [state, dispatch] = useFormState(updateProfile, undefined);

  const genderOptions = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
    { value: "other", label: "Khác" },
  ];
  // --- State cho DatePicker ---
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    user.birthDate ? new Date(user.birthDate) : undefined
  );
  const [selectedCountry, setSelectedCountry] = useState(user.country || "");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    // Đồng bộ state khi prop user thay đổi
    setBirthDate(user.birthDate ? new Date(user.birthDate) : undefined);
    setSelectedCountry(user.country || "");
  }, [user]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.refresh();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={dispatch} className="space-y-8">
      <input
        type="hidden"
        name="birthDate"
        value={birthDate?.toISOString() || ""}
      />

      {/* --- Phần thông tin cá nhân --- */}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={user.image || ""}
            alt={user.name || "User Avatar"}
          />
          <AvatarFallback className="bg-blue-100">
            <User className="w-12 h-12 text-blue-500" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ & Tên</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={user.name || ""}
              required
              placeholder="Nhập họ và tên của bạn"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={user.nickname || ""}
              placeholder="Thêm nickname (tùy chọn)"
            />
          </div>
        </div>
      </div>

      {/* --- Ngày sinh --- */}
      <div className="space-y-2">
        <Label>Ngày sinh</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-between text-left font-normal", // Căn chỉnh justify-between
                !birthDate && "text-muted-foreground"
              )}
            >
              {birthDate ? (
                format(birthDate, "dd/MM/yyyy")
              ) : (
                <span>Chọn ngày sinh</span>
              )}
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={birthDate}
              onSelect={(date) => {
                setBirthDate(date);
                setIsCalendarOpen(false); // Tự động đóng sau khi chọn
              }}
              captionLayout="dropdown" // Thay đổi layout
              fromYear={1900}
              toYear={new Date().getFullYear()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* --- Giới tính --- */}
      <div className="space-y-2">
        <Label>Giới tính</Label>
        <RadioGroup
          name="gender"
          defaultValue={user.gender}
          className="flex items-center gap-6 pt-2"
        >
          {genderOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* --- Quốc tịch --- */}
      <div className="space-y-2">
        <Label htmlFor="country">Quốc tịch</Label>
        <Select
          id="country"
          name="country"
          value={selectedCountry}
          onValueChange={setSelectedCountry}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn quốc tịch" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <SubmitButton content="Lưu thay đổi" />
      </div>
    </form>
  );
}
