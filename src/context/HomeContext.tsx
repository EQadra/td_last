import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import api from "../utils/axios";

interface HomeContextProps {
  doctors: any[];
  lawyers: any[];
  associations: any[];
  shops: any[];
  loading: boolean;
  error: string | null;

  fetchHomeData: () => Promise<void>;
}

const HomeContext = createContext<HomeContextProps>(
  {} as HomeContextProps
);

export const HomeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     🔥 HOME DATA
     ========================= */
  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        doctorsRes,
        lawyersRes,
        associationsRes,
        shopsRes,
      ] = await Promise.all([
        api.get("/doctors/latest"),
        api.get("/lawyers/latest"),
        api.get("/associations/latest"),
        api.get("/shops/latest"),
      ]);

      setDoctors(doctorsRes.data);
      setLawyers(lawyersRes.data);
      setAssociations(associationsRes.data);
      setShops(shopsRes.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al cargar datos del home"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <HomeContext.Provider
      value={{
        doctors,
        lawyers,
        associations,
        shops,
        loading,
        error,
        fetchHomeData,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => useContext(HomeContext);
