/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/themes/PreviewWindow.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Alert, AlertDescription, AlertTitle } from "@merge/ui/components/alert";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@merge/ui/components/tabs";

function PreviewHeader() {
    return (
        <header className="border-b px-4 py-2">
            <div>
                <span className="font-medium">Preview</span>
            </div>
        </header>
    );
}

type PreviewWindowProps = {
    cssVars: Record<string, string>;
};

export const PreviewWindow = ({ cssVars }: PreviewWindowProps) => (
    <>
        <style>{`
      .preview {
        ${Object.entries(cssVars)
            .map(([key, value]) => `--pf-v5-global--${key}: ${value};`)
            .join("\n")}
      }
    `}</style>
        <div className="preview min-h-screen flex flex-col">
            <PreviewHeader />
            <div
                className="flex-1 p-4"
                style={{
                    backgroundColor: cssVars["BackgroundColor--light-100"]
                }}
            >
                <Tabs defaultValue="tab2" className="p-4">
                    <TabsList>
                        <TabsTrigger value="tab1">Tab One</TabsTrigger>
                        <TabsTrigger value="tab2">Tab Two</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" />
                    <TabsContent value="tab2" />
                </Tabs>
                <Alert variant="destructive" className="my-2">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription />
                </Alert>
                <Alert variant="default" className="my-2">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription />
                </Alert>
                <p className="p-4 text-sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <form className="space-y-2">
                    <Input id="test" placeholder="Text input" />
                    <div className="flex gap-2">
                        <Button>Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="link">Link button</Button>
                    </div>
                </form>
            </div>
        </div>
    </>
);
