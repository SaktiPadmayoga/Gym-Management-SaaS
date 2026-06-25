with open('app/Services/ClassBookingService.php', 'r') as f:
    content = f.read()

# 1. Remove assertBookable from book()
old_book = """    public function book(
        ClassSchedule $schedule,
        Member $member,
        ?string $staffId = null,
        ?string $notes = null,
        string $paymentMethod = 'midtrans'
    ): array {
        $this->assertBookable($schedule, $member);

        $plan = $schedule->classPlan;"""

new_book = """    public function book(
        ClassSchedule $schedule,
        Member $member,
        ?string $staffId = null,
        ?string $notes = null,
        string $paymentMethod = 'midtrans'
    ): array {
        $plan = $schedule->classPlan;"""
content = content.replace(old_book, new_book)

# 2. Add locking to bookFree()
old_bookFree = """    private function bookFree(ClassSchedule $schedule, Member $member, ?string $staffId, ?string $notes): array
    {
        $attendance = DB::transaction(function () use ($schedule, $member, $staffId, $notes) {
            $attendance = ClassAttendance::withTrashed()->updateOrCreate(
                [
                    'class_schedule_id' => $schedule->id,"""

new_bookFree = """    private function bookFree(ClassSchedule $schedule, Member $member, ?string $staffId, ?string $notes): array
    {
        $attendance = DB::transaction(function () use ($schedule, $member, $staffId, $notes) {
            $lockedSchedule = ClassSchedule::lockForUpdate()->find($schedule->id);
            $this->assertBookable($lockedSchedule, $member);

            $attendance = ClassAttendance::withTrashed()->updateOrCreate(
                [
                    'class_schedule_id' => $lockedSchedule->id,"""
content = content.replace(old_bookFree, new_bookFree)

# Replace $schedule->increment in bookFree
old_inc_free = """            $schedule->increment('total_booked');

            return $attendance;
        });"""

new_inc_free = """            $lockedSchedule->increment('total_booked');

            return $attendance;
        });"""
content = content.replace(old_inc_free, new_inc_free)


# 3. Add locking to bookPaid()
old_bookPaid = """    private function bookPaid(
        ClassSchedule $schedule,
        Member $member,
        ?string $staffId,
        ?string $notes,
        string $paymentMethod
    ): array {
        $plan   = $schedule->classPlan;
        $isCash = $paymentMethod === 'cash';

        return DB::transaction(function () use ($schedule, $plan, $member, $staffId, $notes, $paymentMethod, $isCash) {

            // 1. Buat Invoice"""

new_bookPaid = """    private function bookPaid(
        ClassSchedule $schedule,
        Member $member,
        ?string $staffId,
        ?string $notes,
        string $paymentMethod
    ): array {
        $plan   = $schedule->classPlan;
        $isCash = $paymentMethod === 'cash';

        return DB::transaction(function () use ($schedule, $plan, $member, $staffId, $notes, $paymentMethod, $isCash) {
            $lockedSchedule = ClassSchedule::lockForUpdate()->find($schedule->id);
            $this->assertBookable($lockedSchedule, $member);

            // 1. Buat Invoice"""
content = content.replace(old_bookPaid, new_bookPaid)


# Replace $schedule->id with $lockedSchedule->id for attendance creation in bookPaid
old_att_paid = """            // 3. Buat/Update ClassAttendance
            $attendance = ClassAttendance::withTrashed()->updateOrCreate(
                [
                    'class_schedule_id' => $schedule->id,
                    'member_id'         => $member->id,"""

new_att_paid = """            // 3. Buat/Update ClassAttendance
            $attendance = ClassAttendance::withTrashed()->updateOrCreate(
                [
                    'class_schedule_id' => $lockedSchedule->id,
                    'member_id'         => $member->id,"""
content = content.replace(old_att_paid, new_att_paid)

# Replace $schedule->increment in bookPaid cash
old_inc_paid_cash = """            // 5. CASH: slot langsung terkurangi, tidak perlu Midtrans
            if ($isCash) {
                $schedule->increment('total_booked');"""
new_inc_paid_cash = """            // 5. CASH: slot langsung terkurangi, tidak perlu Midtrans
            if ($isCash) {
                $lockedSchedule->increment('total_booked');"""
content = content.replace(old_inc_paid_cash, new_inc_paid_cash)

# Replace $schedule->increment in bookPaid midtrans
old_inc_paid_mid = """            // cancel attendance dan decrement kembali.
            $schedule->increment('total_booked');"""
new_inc_paid_mid = """            // cancel attendance dan decrement kembali.
            $lockedSchedule->increment('total_booked');"""
content = content.replace(old_inc_paid_mid, new_inc_paid_mid)


with open('app/Services/ClassBookingService.php', 'w') as f:
    f.write(content)

