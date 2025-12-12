/** 
 *Tipo para paginación de resultados 
*/
export type Pagination = {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}