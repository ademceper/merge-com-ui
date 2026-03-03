import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@merge/ui/components/sidebar';
import { HeaderNavigation } from '@/components/header-navigation/header-navigation';
import { NovuAppSidebar } from '@/components/novu-app-sidebar';
import { PageHeaderProvider, usePageHeaderContext } from '@/context/page-header';

function DashboardLayoutContent() {
  const { startItems } = usePageHeaderContext();

  return (
    <SidebarInset className="md:peer-data-[variant=inset]:bg-sidebar! md:peer-data-[variant=inset]:overflow-clip!">
      <HeaderNavigation startItems={startItems} />
      <div className="flex flex-1 flex-col px-4 pb-4 bg-background md:rounded-t-xl overflow-y-auto min-h-0">
        <Outlet />
      </div>
    </SidebarInset>
  );
}

export function DashboardLayoutRoute() {
  return (
    <PageHeaderProvider>
      <SidebarProvider defaultOpen={true} className="h-svh bg-sidebar overflow-hidden">
        <NovuAppSidebar />
        <DashboardLayoutContent />
      </SidebarProvider>
    </PageHeaderProvider>
  );
}
