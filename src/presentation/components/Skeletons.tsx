export const SuggestedItemSkeleton = () => (
  <div className="bg-white rounded-2xl w-[220px] flex-shrink-0 overflow-hidden shadow-sm border border-gray-100 snap-start pb-3 flex flex-col animate-pulse">
    <div className="h-32 w-full bg-gray-100" />
    <div className="px-3 py-3 flex flex-col gap-2">
      <div className="h-4 w-3/4 bg-gray-100 rounded" />
      <div className="h-3 w-1/2 bg-gray-50 rounded" />
      <div className="flex gap-2 mt-2">
        <div className="h-3 w-10 bg-gray-50 rounded" />
        <div className="h-3 w-10 bg-gray-50 rounded" />
      </div>
      <div className="flex justify-between mt-4">
        <div className="h-4 w-12 bg-gray-100 rounded" />
        <div className="h-4 w-10 bg-green-50 rounded" />
      </div>
    </div>
  </div>
);

export const MenuPageSkeleton = () => (
  <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 animate-pulse">
    {/* Hero Skeleton */}
    <div className="h-64 bg-gray-200 w-full" />
    
    <div className="max-w-md lg:max-w-6xl mx-auto px-4 -mt-12 relative z-10">
      <div className="bg-white rounded-[24px] p-8 shadow-xl border border-gray-100">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-1/4 bg-gray-100 rounded mb-6" />
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-50 rounded" />
          <div className="h-4 w-20 bg-gray-50 rounded" />
          <div className="h-4 w-20 bg-gray-50 rounded" />
        </div>
      </div>
    </div>

    <div className="max-w-md lg:max-w-6xl mx-auto px-4 mt-8">
      <div className="flex gap-6 border-b border-gray-100 pb-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-4 w-16 bg-gray-100 rounded" />)}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-white rounded-2xl h-48 p-4 border border-gray-50 shadow-sm flex flex-col gap-3">
             <div className="h-24 w-full bg-gray-100 rounded-xl" />
             <div className="h-4 w-3/4 bg-gray-100 rounded" />
             <div className="h-4 w-1/4 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const OrderTrackingSkeleton = () => (
  <div className="min-h-screen bg-[#F8F9FA] font-sans pb-24 animate-pulse">
    {/* Navbar Skeleton */}
    <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 shadow-sm">
      <div className="w-10 h-10 bg-gray-100 rounded-full mr-4" />
      <div className="h-6 w-32 bg-gray-100 rounded" />
    </div>

    <div className="max-w-md lg:max-w-[1000px] mx-auto px-4 pt-6 flex flex-col lg:flex-row gap-8">
      {/* Left Col */}
      <div className="flex flex-col gap-6 w-full lg:flex-1">
        <div className="bg-white rounded-[32px] h-96 p-8 border border-gray-100 flex flex-col gap-8">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-6 w-1/3 bg-red-50 rounded" />
            </div>
          </div>
          <div className="h-0.5 bg-gray-50 w-full" />
          <div className="flex flex-col gap-4">
             <div className="h-4 w-1/4 bg-gray-100 rounded" />
             <div className="h-3 w-3/4 bg-gray-50 rounded" />
          </div>
        </div>
      </div>

      {/* Right Col */}
      <div className="flex flex-col gap-6 w-full lg:flex-1">
        <div className="bg-white rounded-[32px] h-[500px] p-10 border border-gray-100">
          <div className="h-6 w-1/4 mx-auto bg-gray-100 rounded mb-10" />
          <div className="flex flex-col gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-6 items-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-1/2 bg-gray-100 rounded" />
                  <div className="h-3 w-1/3 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const OrdersPageSkeleton = () => (
  <div className="w-full bg-[#FAFAFA] min-h-screen pb-20 font-sans flex flex-col items-center animate-pulse">
    <div className="w-full mt-4 md:mt-10 max-w-md bg-white min-h-screen flex flex-col shadow-sm">
      <div className="px-5 pt-6 pb-2">
        <div className="h-8 w-1/3 bg-gray-100 rounded" />
      </div>
      <div className="flex px-5 border-b border-gray-200 mt-4">
        <div className="h-8 w-20 bg-gray-50 rounded mr-6" />
        <div className="h-8 w-20 bg-gray-50 rounded" />
      </div>
      <div className="flex-1 px-5 py-6 flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="border border-gray-100 rounded-[16px] p-4 flex flex-col bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                  <div className="h-3 w-20 bg-gray-50 rounded" />
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 flex-1 bg-gray-50 rounded-[10px]" />
              <div className="h-10 flex-1 bg-gray-50 rounded-[10px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
