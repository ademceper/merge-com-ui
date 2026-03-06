import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarPage, SidebarProvider } from '@merge-rd/ui/components/sidebar';
import { HeaderNavigation } from '@/components/header-navigation/header-navigation';
import { NovuAppSidebar } from '@/components/novu-app-sidebar';
import { PageHeaderProvider, usePageHeaderContext } from '@/context/page-header';

function DashboardLayoutContent() {
  const { startItems } = usePageHeaderContext();

  return (
    <SidebarInset>
      <HeaderNavigation startItems={startItems} />
      <SidebarPage className="px-4 pb-4">
        <Outlet />
      </SidebarPage>
    </SidebarInset>
  );
}

export function DashboardLayoutRoute() {
  return (
    <PageHeaderProvider>
      <SidebarProvider defaultOpen={true} className="h-svh bg-sidebar overflow-hidden" data-scale-wrapper>
        <NovuAppSidebar />
        <DashboardLayoutContent />
      </SidebarProvider>
    </PageHeaderProvider>
  );
}
