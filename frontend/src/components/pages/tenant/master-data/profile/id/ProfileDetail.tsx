// "use client";

// import { Icon } from "@/components/icon";
// import CustomButton from "@/components/ui/button/CustomButton";
// import { TextInput } from "@/components/ui/input/Input";
// import Tabs from "@/components/ui/navigation/CustomTabs";
// import Image from "next/image";
// import { useMemo, useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { useParams, notFound, useRouter } from "next/navigation";

// import { ProfileData } from "@/lib/dummy/profileDummy";
// import { profileData } from "@/types/profile";

// // ================= TABS =================
// const tabs = [
//     { label: "Member Details", value: "/" },
//     { label: "PT Session", value: "pt-session" },
//     { label: "Class", value: "class" },
//     { label: "POS", value: "pos" },
//     { label: "Loyality", value: "loyality" },
// ];

// export default function ProfileDetail() {
//     const router = useRouter();
//     const params = useParams();
//     const id = params.id as string;

//     const [isEditMode, setIsEditMode] = useState(false);

//     const profileDetail = useMemo(() => {
//         return ProfileData.find((item) => item.id.toLowerCase() === id.toLowerCase());
//     }, [id]);

//     if (!profileDetail) {
//         notFound();
//     }

//     const form = useForm<profileData>({
//         defaultValues: {
//             name: profileDetail.name,
//             email: profileDetail.email,
//             phone: profileDetail.phone,
//             birthDate: profileDetail.birthDate,
//             address: profileDetail.address,
//             gender: profileDetail.gender,
//         },
//     });

//     const handleEditClick = () => setIsEditMode(true);

//     const handleCancelClick = () => {
//         form.reset({
//             name: profileDetail.name,
//             email: profileDetail.email,
//             phone: profileDetail.phone,
//             birthDate: profileDetail.birthDate,
//             address: profileDetail.address,
//             gender: profileDetail.gender,
//         });
//         setIsEditMode(false);
//     };

//     const handleSaveClick = () => {
//         setIsEditMode(false);
//         toast.success("Data successfully updated", {
//             style: { background: "green", color: "white" },
//         });
//     };

//     return (
//         <div className="space-y-4 rounded-xl bg-white px-6 py-4">
//             <FormProvider {...form}>
//                 <form>
//                     <div className="breadcrumbs text-sm text-zinc-800 mb-6">
//                         <ul>
//                             <li>
//                                 <a>Master Data</a>
//                             </li>
//                             <li>
//                                 <a>Profile</a>
//                             </li>
//                             <li className="text-aksen-primary">{profileDetail.name}</li>
//                         </ul>
//                     </div>
//                     <div className="mb-6 flex items-center gap-3">
//                         <button className="hover:cursor-pointer" onClick={() => router.push("/profile")} type="button">
//                             <Icon name="back" className="h-8 w-8 text-zinc-800 " />
//                         </button>
//                         <h1 className="text-2xl font-semibold text-gray-800">{profileDetail.name}</h1>
//                     </div>

//                     {/* TABS */}
//                     <div className="mb-6">
//                         <Tabs tabs={tabs} basePath={`/profile/${id}`} defaultValue="/" fullWidth onChange={() => {}} />
//                     </div>

//                     {/* HEADER */}
//                     <div className="mb-6 flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <h1 className="text-2xl font-semibold text-gray-800">Member Details</h1>
//                         </div>

//                         {!isEditMode ? (
//                             <CustomButton iconName="edit" className="bg-aksen-primary px-9 py-2 text-white font-sm" type="button" onClick={handleEditClick}>
//                                 Edit
//                             </CustomButton>
//                         ) : (
//                             <div className="flex gap-3">
//                                 <CustomButton className="border border-aksen-primary bg-white px-4 py-2 text-black font-sm" type="button" onClick={handleCancelClick}>
//                                     Cancel
//                                 </CustomButton>
//                                 <CustomButton type="button" className="bg-aksen-primary px-4 py-2 text-white font-sm" onClick={handleSaveClick}>
//                                     Save Changes
//                                 </CustomButton>
//                             </div>
//                         )}
//                     </div>

//                     {/* PROFILE + DETAILS */}
//                     <div className="grid grid-cols-12 gap-5">
//                         {/* PHOTO */}
//                         <div className="relative flex w-auto flex-col items-center border border-aksen-primary rounded-2xl p-4 col-span-5">
//                             <div className="relative h-38 w-38">
//                                 <Image src="/images/logo-arcom.png" alt="Profile" fill className="rounded-full object-cover" />
//                             </div>

//                             {isEditMode && (
//                                 <div className="absolute right-0 top-22 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-aksen-primary text-white">
//                                     <Icon name="edit" />
//                                 </div>
//                             )}
//                         </div>

//                         {/* ================= MEMBERSHIP CARD ================= */}
//                         <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-aksen-secondary via-aksen-secondary/80 to-aksen-secondary p-5 text-white shadow-xl col-span-7">
//                             {/* GLOW */}
//                             <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-aksen-primary/30 blur-3xl" />

//                             {/* STATUS */}
//                             <span className="absolute right-4 top-4 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">ACTIVE</span>

//                             {/* HEADER */}
//                             <div className="relative z-10 mb-6 flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs uppercase tracking-widest text-gray-400">Membership Card</p>
//                                     <h2 className="text-xl font-semibold">Premium Gym Access</h2>
//                                 </div>
//                             </div>

//                             {/* MEMBER ID */}
//                             <p className="mb-4 text-lg tracking-widest text-gray-200">ID: PROFILE-001</p>

//                             {/* INFO */}
//                             <div className="relative z-10 grid grid-cols-2 gap-4 text-sm">
//                                 <div>
//                                     <p className="text-gray-400">Valid Until</p>
//                                     <p className="font-medium">31 Dec 2025</p>
//                                 </div>

//                                 <div>
//                                     <p className="text-gray-400">Remaining</p>
//                                     <p className="font-medium text-green-400">24 Days</p>
//                                 </div>

//                                 <div>
//                                     <p className="text-gray-400">Price</p>
//                                     <p className="font-medium">Rp 750.000 / Month</p>
//                                 </div>

//                                 <div>
//                                     <p className="text-gray-400">Member Type</p>
//                                     <p className="font-medium">Professional</p>
//                                 </div>
//                             </div>

//                             {/* FOOTER */}
//                             <div className="relative z-10 mt-6 flex items-center justify-between">
//                                 <p className="text-xs tracking-wide text-gray-400">© GYM MANAGEMENT SYSTEM</p>

//                                 <div className="flex gap-2">
//                                     <CustomButton type="button" className="border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur">
//                                         Upgrade
//                                     </CustomButton>

//                                     <CustomButton type="button" className="bg-aksen-primary px-4 py-1.5 text-xs text-black">
//                                         Renew
//                                     </CustomButton>
//                                 </div>
//                             </div>
//                         </div>
//                         {/* ================= END MEMBERSHIP CARD ================= */}

//                         {/* PERSONAL DETAILS */}
//                         <div className="flex w-full flex-col space-y-4 col-span-6">
//                             <h2 className="text-lg font-medium text-geonet-black">Personal Details</h2>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <TextInput label="Name" name="name" disabled={!isEditMode} />
//                                 <TextInput label="Phone" name="phone" disabled={!isEditMode} />
//                                 <TextInput label="Birth Date" name="birthDate" disabled={!isEditMode} />
//                                 <TextInput label="Address" name="address" disabled={!isEditMode} />
//                                 <TextInput label="Email" name="email" disabled />
//                             </div>

//                             <a className="cursor-pointer text-sm text-geonet-blue underline">Click here to change email</a>
//                         </div>
//                     </div>
//                 </form>
//             </FormProvider>
//         </div>
//     );
// }
