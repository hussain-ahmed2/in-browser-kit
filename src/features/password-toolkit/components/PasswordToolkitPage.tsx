'use client'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs'
import { PasswordGenerator } from './PasswordGenerator'
import { PasswordStrengthChecker } from './PasswordStrengthChecker'

export function PasswordToolkitPage() {
    return (
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
            <CardHeader>
                <CardTitle>Password Toolkit</CardTitle>
                <CardDescription>
                    Generate secure passwords or check the strength of your own
                    — all locally in your browser.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <Tabs defaultValue="generate" className="gap-4">
                    <TabsList className="mx-auto flex">
                        <TabsTrigger value="generate">Generate</TabsTrigger>
                        <TabsTrigger value="strength">
                            Strength Check
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate">
                        <PasswordGenerator />
                    </TabsContent>
                    <TabsContent value="strength">
                        <PasswordStrengthChecker />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
