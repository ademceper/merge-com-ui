import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { ColorPicker } from "@/components/primitives/color-picker";
import {
	FormControl,
	FormField,
	FormInput,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/primitives/form/form";

export const environmentFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	color: z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex color, like #123456."),
});

export type EnvironmentFormData = z.infer<typeof environmentFormSchema>;

type EnvironmentFormFieldsProps = {
	form: UseFormReturn<EnvironmentFormData>;
	colorHelperText?: string;
	autoFocusName?: boolean;
};

export function EnvironmentFormFields({
	form,
	colorHelperText,
	autoFocusName = true,
}: EnvironmentFormFieldsProps) {
	return (
		<>
			<FormField
				control={form.control}
				name="name"
				render={({ field }) => (
					<FormItem>
						<FormLabel required>Name</FormLabel>
						<FormControl>
							<FormInput {...field} autoFocus={autoFocusName} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="color"
				render={({ field }) => (
					<FormItem>
						<FormLabel required>Color</FormLabel>
						<FormControl>
							<ColorPicker
								pureInput={false}
								value={field.value}
								onChange={field.onChange}
							/>
						</FormControl>
						<FormMessage>{colorHelperText}</FormMessage>
					</FormItem>
				)}
			/>
		</>
	);
}
