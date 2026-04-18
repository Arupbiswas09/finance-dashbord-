import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { Shield, BarChart3, FileText, Mail, Settings, LogOut, User, Building2, ChevronDown, Heart, Calendar, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Role-based navigation items
  const getNavItems = () => {
    if (!user?.role) return [];
    
    const roleName = user.role.name;
    const baseItems = [
      { href: "/reports", label: "Reports", icon: FileText, roles: ["admin", "manager", "viewer"] }
    ];
    
    if (roleName === "admin") {
      return [
        { href: "/dashboard-modern", label: "Dashboard", icon: BarChart3, roles: ["admin"] },
        ...baseItems,
        { href: "/invoices", label: "Invoices", icon: FileText, roles: ["admin", "manager"] },
        { href: "/newsletter", label: "Newsletter", icon: Mail, roles: ["admin", "manager"] },
        { href: "/clients", label: "Clients", icon: Building2, roles: ["admin", "manager"] },
        { href: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
      ];
    } else if (roleName === "manager") {
      return [
        ...baseItems,
        { href: "/invoices", label: "Invoices", icon: FileText, roles: ["admin", "manager"] },
        { href: "/newsletter", label: "Newsletter", icon: Mail, roles: ["admin", "manager"] },
        { href: "/clients", label: "Clients", icon: Building2, roles: ["admin", "manager"] },
      ];
    } else {
      return baseItems; // Viewers only see reports
    }
  };
  
  const navItems = getNavItems();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link to="/dashboard-modern" className="flex items-center gap-2 flex-shrink-0">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-bold hidden xs:inline">SmartAccount AI</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-smooth px-3 py-2 rounded-md",
                    isActive 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {loading && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-8 w-20 sm:w-24 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-24 sm:w-32 bg-muted animate-pulse rounded"></div>
            </div>
          )}

          {!loading && user && (
            <>
              {/* Organization Settings Dropdown - Admin Only - Hidden on small screens */}
              {user.role?.name === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 hover:bg-accent/50 transition-colors">
                      <Building2 className="h-4 w-4" />
                      <span className="hidden lg:inline font-medium">{user.organization?.name || 'Organization'}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-1">
                    <DropdownMenuItem asChild>
                      <Link to="/organization-settings?tab=details" className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-accent transition-colors">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Organization Details</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/organization-settings?tab=integration" className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-accent transition-colors">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Integration</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/organization-settings?tab=automation" className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-accent transition-colors">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Automation</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/organization-settings?tab=notifications" className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-accent transition-colors">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/organization-settings?tab=users" className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-accent transition-colors">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Users</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* User Info Dropdown - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2 hover:bg-accent/50 transition-colors">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden lg:inline font-medium">{user.full_name || user.email.split('@')[0]}</span>
                    <span className="text-muted-foreground hidden lg:inline">•</span>
                    <span className="text-muted-foreground capitalize hidden lg:inline text-xs">{user.role?.name || 'User'}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-1">
                  <div className="px-3 py-2 text-sm border-b">
                    <p className="font-semibold">{user.full_name || user.email.split('@')[0]}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-accent transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Personal Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-destructive/10 text-destructive focus:text-destructive transition-colors">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Shield className="h-6 w-6 text-primary" />
                      SmartAccount AI
                    </SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 flex flex-col space-y-3">
                    {/* User Info */}
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-3 px-2 py-2">
                        <User className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{user.full_name || user.email.split('@')[0]}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground capitalize mt-1">Role: {user.role?.name || 'User'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Organization Info - Admin Only */}
                    {user.role?.name === 'admin' && user.organization && (
                      <div className="border-b pb-4">
                        <div className="flex items-center gap-2 px-2 py-2 text-sm">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{user.organization.name}</p>
                            <p className="text-xs text-muted-foreground">Organization ID: {user.organization.org_id}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Links */}
                    <nav className="flex flex-col space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>

                    {/* Organization Settings - Admin Only */}
                    {user.role?.name === 'admin' && (
                      <>
                        <div className="border-t pt-4">
                          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Organization Settings
                          </p>
                          <div className="flex flex-col space-y-1">
                            <Link
                              to="/organization-settings?tab=details"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                            >
                              <Building2 className="h-5 w-5" />
                              Organization Details
                            </Link>
                            <Link
                              to="/organization-settings?tab=integration"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                            >
                              <Settings className="h-5 w-5" />
                              Integration
                            </Link>
                            <Link
                              to="/organization-settings?tab=automation"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                            >
                              <Calendar className="h-5 w-5" />
                              Automation
                            </Link>
                            <Link
                              to="/organization-settings?tab=notifications"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                            >
                              <Mail className="h-5 w-5" />
                              Notifications
                            </Link>
                            <Link
                              to="/organization-settings?tab=users"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                            >
                              <User className="h-5 w-5" />
                              Users
                            </Link>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Personal Settings & Logout */}
                    <div className="border-t pt-4 mt-auto">
                      <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                      >
                        <Settings className="h-5 w-5" />
                        Personal Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}

          {!loading && !user && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;